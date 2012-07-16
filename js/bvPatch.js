/*
Represents a bezier view patch object
*/
var bvPatch, bvshader;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
bvPatch = (function() {
  __extends(bvPatch, THREE.Mesh);
  bvPatch.Normal = 0;
  bvPatch.CurvatureColor = 1;
  bvPatch.HighlightLine = 2;
  bvPatch.ReflectionLine = 3;
  function bvPatch(patch, parameters) {
    var attributes, bvmaterial, i, patch_geo, uniforms, _ref, _ref10, _ref11, _ref12, _ref13, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    parameters = parameters || {};
    this.renderMode = (_ref = parameters.renderMode) != null ? _ref : bvPatch.Normal;
    this.subdivisionLevel = (_ref2 = parameters.subdivisionLevel) != null ? _ref2 : 5;
    this.color = new THREE.Color((_ref3 = parameters.color) != null ? _ref3 : 0xff1111);
    this.ambient = new THREE.Color((_ref4 = parameters.ambient) != null ? _ref4 : 0x050505);
    this.specular = new THREE.Color((_ref5 = parameters.specular) != null ? _ref5 : 0xAAAAAA);
    this.shininess = (_ref6 = parameters.shininess) != null ? _ref6 : 30;
    this.highlightLineColor = new THREE.Color((_ref7 = parameters.highlightLineColor) != null ? _ref7 : 0x116611);
    this.maxCrv = ((_ref8 = parameters.maxCrv) != null ? _ref8 : [1000, 1000, 1000, 1000]).slice();
    this.minCrv = ((_ref9 = parameters.minCrv) != null ? _ref9 : [-1000, -1000, -1000, -1000]).slice();
    this.crvType = (_ref10 = parameters.crvType) != null ? _ref10 : 0;
    this.hl_step = (_ref11 = parameters.hl_step) != null ? _ref11 : 5.0;
    patch_geo = eval_patch(patch, this.subdivisionLevel);
    patch_geo.computeBoundingBox();
    patch_geo.dynamic = true;
    attributes = {
      crv: {
        type: 'v4',
        value: []
      },
      hr_val: {
        type: 'f',
        value: []
      }
    };
    uniforms = THREE.UniformsUtils.clone(bvshader.uniforms);
    bvmaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(bvshader.uniforms),
      attributes: attributes,
      vertexShader: bvshader.vertexShader,
      fragmentShader: bvshader.fragmentShader,
      perPixel: true,
      lights: true
    });
    if ((patch_geo.rawCrv != null)) {
      for (i = 0, _ref12 = patch_geo.rawCrv.length; 0 <= _ref12 ? i < _ref12 : i > _ref12; 0 <= _ref12 ? i++ : i--) {
        attributes.crv.value[i] = patch_geo.rawCrv[i];
      }
    } else {
      for (i = 0, _ref13 = patch_geo.vertices.length; 0 <= _ref13 ? i < _ref13 : i > _ref13; 0 <= _ref13 ? i++ : i--) {
        attributes.crv.value[i] = new THREE.Vector4();
      }
    }
    THREE.Mesh.call(this, patch_geo, bvmaterial);
    this.doubleSided = true;
    this.setRenderMode(this.renderMode);
    this.updateAttributes();
  }
  bvPatch.prototype.getRenderMode = function() {
    return this.renderMode;
  };
  bvPatch.prototype.setRenderMode = function(mode) {
    if (this.renderMode === mode) {
      return;
    }
    this.renderMode = mode;
    switch (mode) {
      case bvPatch.HighlightLine:
      case bvPatch.ReflectionLine:
        this.updateHighlight();
    }
    return this.updateAttributes();
  };
  bvPatch.prototype.setCurvatureRange = function(minc, maxc) {
    var i;
    for (i = 0; i < 4; i++) {
      this.maxCrv[i] = isNaN(maxc[i]) ? 1000 : maxc[i];
      this.minCrv[i] = isNaN(minc[i]) ? -1000 : minc[i];
    }
    return this.updateAttributes();
  };
  bvPatch.prototype.updateHighlight = function() {
    return calc_HA(this, this.material.uniforms.dirA.value, this.material.uniforms.dirH.value);
  };
  bvPatch.prototype.updateAttributes = function() {
    this.material.uniforms.diffuse.value.copy(this.color);
    this.material.uniforms.ambient.value.copy(this.ambient);
    this.material.uniforms.specular.value.copy(this.specular);
    this.material.uniforms.shininess.value = this.shininess;
    this.material.uniforms.renderMode.value = this.renderMode;
    this.material.uniforms.crvType.value = this.crvMode;
    this.material.uniforms.maxCrv.value.set(this.maxCrv[0], this.maxCrv[1], this.maxCrv[2], this.maxCrv[3]);
    this.material.uniforms.minCrv.value.set(this.minCrv[0], this.minCrv[1], this.minCrv[2], this.minCrv[3]);
    this.material.uniforms.highlightLineColor.value.copy(this.highlightLineColor);
    return this.material.uniforms.hl_step.value = this.hl_step;
  };
  return bvPatch;
})();
bvshader = {
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib["common"], THREE.UniformsLib["lights"], {
      "ambient": {
        type: "c",
        value: new THREE.Color(0xFF0505)
      },
      "specular": {
        type: "c",
        value: new THREE.Color(0xFFFFFF)
      },
      "shininess": {
        type: "f",
        value: 64
      },
      "wrapRGB": {
        type: "v3",
        value: new THREE.Vector3(1, 1, 1)
      },
      "renderMode": {
        type: "i",
        value: 2
      },
      "highlightLineColor": {
        type: 'c',
        value: new THREE.Color(0x000000)
      },
      "maxCrv": {
        type: "v4",
        value: new THREE.Vector4(1000, 1000, 1000, 1000)
      },
      "minCrv": {
        type: "v4",
        value: new THREE.Vector4(-1000, -1000, -1000, -1000)
      },
      "crvType": {
        type: "i",
        value: 0
      },
      "hl_step": {
        type: "f",
        value: 5.0
      },
      "dirA": {
        type: "v4",
        value: new THREE.Vector4(0.0, 0.0, 46.0, 1.0)
      },
      "dirH": {
        type: "v4",
        value: new THREE.Vector4(0.0, 1.0, 0.0, 1.0)
      }
    }
  ]),
  vertexShader: "#define  PHONG_PER_PIXEL\nvarying vec3 vViewPosition;\nvarying vec3 vNormal;\nvarying vec3 vFixedNormal;\nvarying vec3 vColor;\nvarying vec4 vPos;\n//varying float p_hr_val;\n//attribute float hr_val;\nattribute vec4 crv;\nuniform int renderMode;\nuniform int crvMode;\nuniform vec4 maxCrv;\nuniform vec4 minCrv;\n" + "\n" + THREE.ShaderChunk["lights_phong_pars_vertex"] + "\n" + "\n\nvec3 crv2color(vec4 curvature){\n    float maxc,minc,c;\n    vec3 colors[5];\n    colors[0] = vec3(0.0 , 0.0 , 0.85); // blue \n    colors[1] = vec3(0.0 , 0.9 , 0.9 ); // cyan\n    colors[2] = vec3(0.0 , 0.75, 0.0 ); // green \n    colors[3] = vec3(0.9 , 0.9 , 0.0 ); // yellow \n    colors[4] = vec3(0.85, 0.0 , 0.0 ); // red \n    if(crvMode == 0){\n        maxc = maxCrv.x;\n        minc = minCrv.x;\n        c = curvature.x;\n    }\n    if(crvMode == 1){\n        maxc = maxCrv.y;\n        minc = minCrv.y;\n        c = curvature.y;\n    }\n    if(crvMode == 2){\n        maxc = maxCrv.z;\n        minc = minCrv.z;\n        c = curvature.z;\n    }\n    if(crvMode == 3){\n        maxc = maxCrv.w;\n        minc = minCrv.w;\n        c = curvature.w;\n    }\n\n    if(abs(maxc-minc) < 0.00001) {\n        c = 0.5;\n    }\n    else if (c > maxc) {\n        c = 1.0;\n    } else {\n        if ( c < minc){\n          c = 0.0;\n        } else {\n          c = (c-minc)/(maxc-minc);\n        }\n    }\n\n    if(c>1.0)\n        return colors[4];\n    if(c>0.75)\n        return (c-0.75)/0.25*colors[4]+(1.0-c)/0.25*colors[3];\n    if(c>0.5)\n        return (c-0.5)/0.25*colors[3]+(0.75-c)/0.25*colors[2];\n    if(c>0.25)\n        return (c-0.25)/0.25*colors[2]+(0.5-c)/0.25*colors[1];\n    if(c>0.0)\n        return (c)/0.25*colors[1]+(0.25-c)/0.25*colors[0];\n    return colors[0];\n}\n\nvoid main() {\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    vFixedNormal = normal;\n    vPos = vec4(position,1.0);\n    " + "\n    if(renderMode == 1)\n        vColor = crv2color(crv);\n\n    #ifndef USE_ENVMAP\n    vec4 mPosition = objectMatrix * vec4( position, 1.0 );\n    #endif\n\n    vViewPosition = -mvPosition.xyz;\n\n    vec3 transformedNormal = normalMatrix * normal;\n    vNormal = transformedNormal;\n\n    " + THREE.ShaderChunk["lights_phong_vertex"] + "\n    " + "\n    " + THREE.ShaderChunk["default_vertex"] + "\n    " + "\n    //p_hr_val = hr_val;\n}",
  fragmentShader: "#define  PHONG_PER_PIXEL;\nuniform vec3 diffuse;\nuniform float opacity;\n\nuniform vec3 ambient;\nuniform vec3 specular;\nuniform float shininess;\nuniform vec3 highlightLineColor;\n\nuniform int renderMode;\nuniform vec4 dirA;\nuniform vec4 dirH;\nuniform float hl_step;\n" + "\n" + THREE.ShaderChunk["lights_phong_pars_fragment"] + "\n" + "\n//varying float p_hr_val;\nvarying vec3 vColor;\nvarying vec4 vPos;\nvarying vec3 vFixedNormal;\n\nfloat cal_highlight() {\n    vec3 normal = normalize( vFixedNormal );\n    vec3 pos = vPos.xyz/vPos.w;\n    vec3 A = dirA.xyz;\n    vec3 H = dirH.xyz;\n    //vec3 ref_light = reflect((pos-A),normal);\n    if(renderMode == 2){ // highlight mode\n        //A = dirA.xyz;\n    }\n    else if(renderMode == 3){    //reflection light\n        normal = reflect(normalize(pos-dirA.xyz),normal); \n    }\n    vec3 temp = cross(H,normal);\n    float divl = length(temp);\n    if (divl < 0.0001)\n        return 0.0;\n    else\n        return dot(temp,A-pos)/divl;\n}\n\nvoid main() {\n    gl_FragColor = vec4( vec3 ( 1.0 ), opacity );\n\n    " + "\n    " + THREE.ShaderChunk["alphatest_fragment"] + "\n\n    if(renderMode != 1){ // not curvature mode\n        " + THREE.ShaderChunk["lights_phong_fragment"] + "\n        if(renderMode == 2 || renderMode == 3){\n            //float temp = fract(p_hr_val);\n            float temp = fract(cal_highlight()/hl_step);\n            //gl_FragColor = vec4(temp,temp,temp,1.0);\n            if(temp > 1.0/3.0 && temp < 2.0/3.0){\n                gl_FragColor = vec4(highlightLineColor,1.0);\n            }\n        }\n    }\n    " + "\n    else if(renderMode == 1){ // curvature render\n        " + "\n        gl_FragColor = vec4( vColor, opacity );\n    }\n    " + "\n}"
};