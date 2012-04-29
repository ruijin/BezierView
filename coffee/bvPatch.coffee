###
Represents a bezier view patch object
###

# TODO: Perhaps geometry should be passed in
class bvPatch extends THREE.Mesh
    # Class variables
    @Normal = 0
    @CurvatureColor = 1
    @HighlightLine = 2
    @ReflectionLine = 3

    constructor: (patch,parameters) ->
        parameters = parameters || {}

        @renderMode = parameters.renderMode ? bvPatch.Normal
        @subdivisionLevel = parameters.subdivisionLevel ? 5
        @color     = new THREE.Color( parameters.color    ? 0xff1111 )
        @ambient   = new THREE.Color( parameters.ambient  ? 0x050505 )
        @specular  = new THREE.Color( parameters.specular ? 0xAAAAAA )
        @shininess = parameters.shininess ? 30

        @highlightLineColor = new THREE.Color( parameters.highlightLineColor ? 0x116611 )
        @maxCrv = (parameters.maxCrv ? [1000,1000,1000,1000]    ).slice()
        @minCrv = (parameters.minCrv ? [-1000,-1000,-1000,-1000]).slice()
        @crvType = parameters.crvType ? 0
        @hl_step = parameters.hl_step ? 5.0

        # generate geometry
        patch_geo = eval_patch(patch, @subdivisionLevel)
        patch_geo.computeBoundingBox()
        patch_geo.dynamic = true

        # generate material
        attributes =
            crv:
                type: 'v4'
                value: []
            hr_val:
                type: 'f'
                value: []

        uniforms = THREE.UniformsUtils.clone(bvshader.uniforms)

        bvmaterial = new THREE.ShaderMaterial(
            uniforms: THREE.UniformsUtils.clone(bvshader.uniforms) #uniforms,
            attributes:     attributes
            vertexShader:   bvshader.vertexShader # document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: bvshader.fragmentShader # document.getElementById( 'fragmentshader' ).textContent,
            perPixel: true
            lights:true
            #vertexColors :THREE.VertexColors    
        )

        # initial the crv array
        if (patch_geo.rawCrv?)
            for i in [0...patch_geo.rawCrv.length]
                attributes.crv.value[i] = patch_geo.rawCrv[i]
        else
            for i in [0...patch_geo.vertices.length]
                attributes.crv.value[i] = new THREE.Vector4()


        THREE.Mesh.call( this, patch_geo, bvmaterial )
        @doubleSided = true

        @setRenderMode(@renderMode)
        @updateAttributes()


    getRenderMode: () -> return @renderMode

    setRenderMode: (mode) ->
        if (@renderMode == mode)
            return
        @renderMode = mode

        switch(mode)
            when bvPatch.HighlightLine, bvPatch.ReflectionLine
                @updateHighlight()

        @updateAttributes()


    setCurvatureRange: (minc,maxc) ->
        for i in [0...4]
            @maxCrv[i] = if isNaN(maxc[i]) then  1000 else maxc[i]
            @minCrv[i] = if isNaN(minc[i]) then -1000 else minc[i]
        @updateAttributes()


    # recalcuate highlight line
    bvPatch.prototype.updateHighlight = () ->
        # var highlightmode = @renderMode == bvPatch.HighlightLine? HIGHLIGHTLINE : REFLECTLINE
        # console.log(highlightmode)
        # eval_highlight(highlightmode,this,@material.attributes.hr_val.value)
        # @material.attributes.hr_val.needsUpdate = true

        # TODO: pretty laggy when recalculate the directions, especially when the
        #       number of patches is big. Maybe should calculate this outside patch once
        #       and pass in same A and H for all patches. Do it here for simply interface.

        # update dirH and dirA
        calc_HA(this,@material.uniforms.dirA.value,@material.uniforms.dirH.value)


    # Should be called after change any of these values
    bvPatch.prototype.updateAttributes = () ->
        # phong color attribute
        @material.uniforms.diffuse.value.copy(@color)
        @material.uniforms.ambient.value.copy(@ambient)
        @material.uniforms.specular.value.copy(@specular)
        @material.uniforms.shininess.value = @shininess

        #render mode 
        @material.uniforms.renderMode.value = @renderMode

        # curvature relate
        @material.uniforms.crvType.value = @crvMode
        @material.uniforms.maxCrv.value.set(@maxCrv[0],@maxCrv[1],@maxCrv[2],@maxCrv[3])
        @material.uniforms.minCrv.value.set(@minCrv[0],@minCrv[1],@minCrv[2],@minCrv[3])

        # highlight line relate
        @material.uniforms.highlightLineColor.value.copy(@highlightLineColor)
        @material.uniforms.hl_step.value = @hl_step


bvshader = {
    uniforms: THREE.UniformsUtils.merge( [
        THREE.UniformsLib[ "common" ],
        #THREE.UniformsLib[ "fog" ],
        THREE.UniformsLib[ "lights" ],
        #THREE.UniformsLib[ "shadowmap" ],
        {
            "ambient"  : { type: "c", value: new THREE.Color( 0xFF0505 ) },
            "specular" : { type: "c", value: new THREE.Color( 0xFFFFFF ) },
            "shininess": { type: "f", value: 64 },
            "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
            "renderMode": {type: "i" ,value: 2},
            "highlightLineColor": {type: 'c', value: new THREE.Color(0x000000) },
            "maxCrv": {type: "v4", value: new THREE.Vector4(1000,1000,1000,1000) },
            "minCrv": {type: "v4", value: new THREE.Vector4(-1000,-1000,-1000,-1000) },
            "crvType": {type: "i", value: 0},
            "hl_step": {type: "f", value: 5.0},
            "dirA": {type: "v4", value: new THREE.Vector4(0.0, 0.0, 46.0, 1.0) },
            "dirH": {type: "v4", value: new THREE.Vector4(0.0, 1.0, 0.0,  1.0) },
        },
        #{
        #   "renderMode": {type: "i" ,value: 1}
        #}
    ]),

    vertexShader: """
        #define  PHONG_PER_PIXEL
        varying vec3 vViewPosition;
        varying vec3 vNormal;
        varying vec3 vFixedNormal;
        varying vec3 vColor;
        varying vec4 vPos;
        //varying float p_hr_val;
        //attribute float hr_val;
        attribute vec4 crv;
        uniform int renderMode;
        uniform int crvMode;
        uniform vec4 maxCrv;
        uniform vec4 minCrv;
        #{
        #{THREE.ShaderChunk[ "map_pars_vertex" ]}
        #{THREE.ShaderChunk[ "lightmap_pars_vertex" ]}
        #{THREE.ShaderChunk[ "envmap_pars_vertex" ]}
        }
        #{THREE.ShaderChunk[ "lights_phong_pars_vertex" ]}
        #{
        #{THREE.ShaderChunk[ "color_pars_vertex" ]}
        #{THREE.ShaderChunk[ "skinning_pars_vertex" ]}
        #{THREE.ShaderChunk[ "morphtarget_pars_vertex" ]}
        #{THREE.ShaderChunk[ "shadowmap_pars_vertex" ]}
        }

        vec3 crv2color(vec4 curvature){
            float maxc,minc,c;
            vec3 colors[5];
            colors[0] = vec3(0.0 , 0.0 , 0.85); // blue 
            colors[1] = vec3(0.0 , 0.9 , 0.9 ); // cyan
            colors[2] = vec3(0.0 , 0.75, 0.0 ); // green 
            colors[3] = vec3(0.9 , 0.9 , 0.0 ); // yellow 
            colors[4] = vec3(0.85, 0.0 , 0.0 ); // red 
            if(crvMode == 0){
                maxc = maxCrv.x;
                minc = minCrv.x;
                c = curvature.x;
            }
            if(crvMode == 1){
                maxc = maxCrv.y;
                minc = minCrv.y;
                c = curvature.y;
            }
            if(crvMode == 2){
                maxc = maxCrv.z;
                minc = minCrv.z;
                c = curvature.z;
            }
            if(crvMode == 3){
                maxc = maxCrv.w;
                minc = minCrv.w;
                c = curvature.w;
            }

            if(abs(maxc-minc) < 0.00001) {
                c = 0.5;
            }
            else if (c > maxc) {
                c = 1.0;
            } else {
                if ( c < minc){
                  c = 0.0;
                } else {
                  c = (c-minc)/(maxc-minc);
                }
            }

            if(c>1.0)
                return colors[4];
            if(c>0.75)
                return (c-0.75)/0.25*colors[4]+(1.0-c)/0.25*colors[3];
            if(c>0.5)
                return (c-0.5)/0.25*colors[3]+(0.75-c)/0.25*colors[2];
            if(c>0.25)
                return (c-0.25)/0.25*colors[2]+(0.5-c)/0.25*colors[1];
            if(c>0.0)
                return (c)/0.25*colors[1]+(0.25-c)/0.25*colors[0];
            return colors[0];
        }

        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            vFixedNormal = normal;
            vPos = vec4(position,1.0);
            #{
            #{THREE.ShaderChunk[ "map_vertex" ]}
            #{THREE.ShaderChunk[ "lightmap_vertex" ]}
            #{THREE.ShaderChunk[ "envmap_vertex" ]}
            #{THREE.ShaderChunk[ "color_vertex" ]}
            }
            if(renderMode == 1)
                vColor = crv2color(crv);

            #ifndef USE_ENVMAP
            vec4 mPosition = objectMatrix * vec4( position, 1.0 );
            #endif

            vViewPosition = -mvPosition.xyz;

            vec3 transformedNormal = normalMatrix * normal;
            vNormal = transformedNormal;

            #{THREE.ShaderChunk[ "lights_phong_vertex" ]}
            #{
            #{THREE.ShaderChunk[ "skinning_vertex" ]}
            #{THREE.ShaderChunk[ "morphtarget_vertex" ]}
            }
            #{THREE.ShaderChunk[ "default_vertex" ]}
            #{
            #{THREE.ShaderChunk[ "shadowmap_vertex" ]}
            }
            //p_hr_val = hr_val;
        }
    """

    fragmentShader: """
        #define  PHONG_PER_PIXEL;
        uniform vec3 diffuse;
        uniform float opacity;

        uniform vec3 ambient;
        uniform vec3 specular;
        uniform float shininess;
        uniform vec3 highlightLineColor;

        uniform int renderMode;
        uniform vec4 dirA;
        uniform vec4 dirH;
        uniform float hl_step;
        #{
        #{THREE.ShaderChunk[ "color_pars_fragment" ]}
        #{THREE.ShaderChunk[ "map_pars_fragment" ]}
        #{THREE.ShaderChunk[ "lightmap_pars_fragment" ]}
        #{THREE.ShaderChunk[ "envmap_pars_fragment" ]}
        #{THREE.ShaderChunk[ "fog_pars_fragment" ]}
        }
        #{THREE.ShaderChunk[ "lights_phong_pars_fragment" ]}
        #{
        #{THREE.ShaderChunk[ "shadowmap_pars_fragment" ]}
        }
        //varying float p_hr_val;
        varying vec3 vColor;
        varying vec4 vPos;
        varying vec3 vFixedNormal;

        float cal_highlight() {
            vec3 normal = normalize( vFixedNormal );
            vec3 pos = vPos.xyz/vPos.w;
            vec3 A = dirA.xyz;
            vec3 H = dirH.xyz;
            //vec3 ref_light = reflect((pos-A),normal);
            if(renderMode == 2){ // highlight mode
                //A = dirA.xyz;
            }
            else if(renderMode == 3){    //reflection light
                normal = reflect(normalize(pos-dirA.xyz),normal); 
            }
            vec3 temp = cross(H,normal);
            float divl = length(temp);
            if (divl < 0.0001)
                return 0.0;
            else
                return dot(temp,A-pos)/divl;
        }

        void main() {
            gl_FragColor = vec4( vec3 ( 1.0 ), opacity );

            #{
            #{THREE.ShaderChunk[ "map_fragment" ]}
            }
            #{THREE.ShaderChunk[ "alphatest_fragment" ]}

            if(renderMode != 1){ // not curvature mode
                #{THREE.ShaderChunk[ "lights_phong_fragment" ]}
                if(renderMode == 2 || renderMode == 3){
                    //float temp = fract(p_hr_val);
                    float temp = fract(cal_highlight()/hl_step);
                    //gl_FragColor = vec4(temp,temp,temp,1.0);
                    if(temp > 1.0/3.0 && temp < 2.0/3.0){
                        gl_FragColor = vec4(highlightLineColor,1.0);
                    }
                }
            }
            #{
            #{THREE.ShaderChunk[ "lightmap_fragment" ]}
            }
            else if(renderMode == 1){ // curvature render
                #{
                #{THREE.ShaderChunk[ "color_fragment" ]}
                }
                gl_FragColor = vec4( vColor, opacity );
            }
            #{
            #{THREE.ShaderChunk[ "envmap_fragment" ]}
            #{THREE.ShaderChunk[ "shadowmap_fragment" ]}
            #{THREE.ShaderChunk[ "linear_to_gamma_fragment" ]}
            #{THREE.ShaderChunk[ "fog_fragment" ]}
            }
        }
    """
}

