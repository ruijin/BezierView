###
The evaluation functions
###

# Evaluates the patch 
# TODO: 
# -Check type
eval_patch = (patch, subDepth) ->
    type = patch.type

    # TODO: Handle all cases
    switch type
        # polyhedron
        when 1 then return patch.geometry
        # triangular bezier
        when 3 then return eval_triangular(patch, subDepth)
        # tensor-product
        when 4, 5, 8 then return eval_tensor_product(patch, subDepth)
        else
            alert('eval_patch: Unknown patch type ' + type)


# generates the control mesh
eval_control_mesh = (type, degs,vecs) ->
    # different for each type
    geo = new THREE.Geometry()

    # Triangular Bezier
    if (type == 3)
        deg = degs
        
        size = ( (deg+1)*(deg+2) )/2
        for i in [0...size]
            geo.vertices.push(new THREE.Vertex(vecs[i].clone()))
        
        d = deg - 1
        for i in [0..d]
            for j in [0..d-i]
                k = d-i-j
                v1 = b2i_i(i+1,j,k,deg)
                v2 = b2i_i(i,j+1,k,deg)
                v3 = b2i_i(i,j,k+1,deg)
                
                geo.faces.push(new THREE.Face3(v1,v2,v3))

    # Tensor-product Bezier
    else
        degu = degs[0]
        degv = degs[1]

        for i in [0...(degu+1)*(degv+1)]
            if (type == 8) # rationize the vertices
                geo.vertices.push(new THREE.Vertex(vecs[i].clone().divideScalar(vecs[i].w)))
            else
                geo.vertices.push(new THREE.Vertex(vecs[i].clone()))

        stepu = degu+1
        for i in [0...degu]
            for j in [0...degv]
                v1 = i*stepu+j
                v2 = (i+1)*stepu+j
                v3 = (i+1)*stepu+j+1
                v4 = i*stepu+j+1
                geo.faces.push(new THREE.Face4(v1,v2,v3,v4))
                #console.log(v1,v2,v3,v4)

    return geo



# Evaluates triangular bezier patches
# Type 3 
eval_triangular = (patch, subDepth) ->
    loc = 0
    #printf("evaluate starts\n")
    deg = patch.deg
    MAXDEG = deg
    DIM = 4

    # initialize the decasteljau array
    deCastel = new Array((MAXDEG+1)*(MAXDEG+2)/2)
    for i in [0...(MAXDEG+1)*(MAXDEG+2)/2]
        deCastel[i] = new THREE.Vector4()

    #if (deg>MAXDEG)
    #    printf("Maximum degree %d reached, please increase the number.\n", MAXDEG)
    #    exit(0)

    pts = 1 << subDepth

    # allocate the memory for evaluation
    size = (pts+1)*(pts+2)/2
    eval_P = new Array(size)
    eval_N = new Array(size)
    crv_array = new Array(size)
    
    for i in [0...size]
        eval_P[i] = new THREE.Vector4()
        eval_N[i] = new THREE.Vector3()    # TODO: should be Vector4?
        crv_array[i] = new THREE.Vector4()
    
    #eval_P = alloc_mem_db(size*DIM)
    #eval_N = alloc_mem_db(size*DIM)
    #crv_array = alloc_mem_db(size*4)

    for uu in [0..pts]
        for vv in [0..pts-uu]
            point = new THREE.Vector4()

            onbdy = (uu==0)  # on the boundary
            atvtx = (uu==0 && vv==0)

            u = uu/pts
            v = vv/pts
            w = 1-u-v

            # use two different mapping functions
            #  for the interior and the boundary
            if atvtx
                b2i = b2i_k
            else if onbdy
                b2i = b2i_j
            else
                b2i = b2i_i

            # initialize the DeCastel Array
            for i in [0..deg]
                for j in [0..deg-i]
                    k = deg - i - j
                    deCastel[b2i(i,j,k, deg)].copy(
                            patch.pts[b2i(i,j,k, deg)])
                    #console.log("1. " + DeCastel[b2i(i,j,k, deg)])
                    #for m in [0...DIM]
                    #  deCastel[b2i(i,j,k, deg)][m] = coeff[b2i(i,j,k, deg)*DIM+m]

            # de Casteljau algorithm
            for d in [deg-1..1] by -1
                for k in [0..d]
                    for j in [0..d-k]
                        i = d-j-k
                        index = b2i(i,j,k,deg)
                        deCastel[index].x =
                            u * deCastel[b2i(i+1,j,k,deg)].x +
                            v * deCastel[b2i(i,j+1,k,deg)].x +
                            w * deCastel[b2i(i,j,k+1,deg)].x
                        
                        deCastel[index].y =
                            u * deCastel[b2i(i+1,j,k,deg)].y +
                            v * deCastel[b2i(i,j+1,k,deg)].y +
                            w * deCastel[b2i(i,j,k+1,deg)].y
                                            
                        deCastel[index].z =
                            u * deCastel[b2i(i+1,j,k,deg)].z +
                            v * deCastel[b2i(i,j+1,k,deg)].z +
                            w * deCastel[b2i(i,j,k+1,deg)].z
                            
                        #console.log("2. " + deCastel[b2i(i,j,k, deg)])
                        #for m in [0...DIM]
                        # deCastel[b2i(i,j,k,deg)][m] =
                        #  u * deCastel[b2i(i+1,j,k,deg)][m] +
                        #  v * deCastel[b2i(i,j+1,k,deg)][m] +
                        #  w * deCastel[b2i(i,j,k+1,deg)][m]

            # Last step of de Casteljau algorithm
            point.x  = u* deCastel[b2i(1,0,0,deg)].x +
                       v* deCastel[b2i(0,1,0,deg)].x +
                       w* deCastel[b2i(0,0,1,deg)].x
            point.y  = u* deCastel[b2i(1,0,0,deg)].y +
                       v* deCastel[b2i(0,1,0,deg)].y +
                       w* deCastel[b2i(0,0,1,deg)].y
            point.z  = u* deCastel[b2i(1,0,0,deg)].z +
                       v* deCastel[b2i(0,1,0,deg)].z +
                       w* deCastel[b2i(0,0,1,deg)].z

            #V00   = deCastel[(*b2i)(0,0,0,deg)]
            #console.log(point.x + "," + point.y + "," + point.z)
            V00 = point
            if (atvtx)
                V01 = deCastel[b2i(0,1,0,deg)]
                V02 = deCastel[b2i(0,2,0,deg)]
                V10 = deCastel[b2i(1,0,0,deg)]
                V20 = deCastel[b2i(2,0,0,deg)]
                V11 = deCastel[b2i(1,1,0,deg)]
            else if (onbdy)
                V01 = deCastel[b2i(1,0,0,deg)]
                V02 = deCastel[b2i(2,0,0,deg)]
                V10 = deCastel[b2i(0,0,1,deg)]
                V20 = deCastel[b2i(0,0,2,deg)]
                V11 = deCastel[b2i(1,0,1,deg)]
                #printf("On boundary\n")
            else
                V01 = deCastel[b2i(0,0,1,deg)]
                V02 = deCastel[b2i(0,0,2,deg)]
                V10 = deCastel[b2i(0,1,0,deg)]
                V20 = deCastel[b2i(0,2,0,deg)]
                V11 = deCastel[b2i(0,1,1,deg)]

            # compute the point and the normal at the (u,v) parameter
            evalPN(V00, V01, V10, eval_P[loc], eval_N[loc])

            # compute the curvatures (Gaussian, mean, min and max)
            # at the (u,v) parameter
            # TODO: Curvature
            h = crv3(V00, V01, V02, V10, V20, V11, deg, crv_array[loc])

            #printf("value %f at %d \n", h, loc)
            loc++

    # Generate the geometry
    # copied from plot patch for TriBezier
    # i,j

    normal_flipped = false
    geo = new THREE.Geometry()
    
    # all the vertices first
    for i in [0...size]
        geo.vertices.push(new THREE.Vertex(eval_P[i]))
        #console.log(geo.vertices[i])
    
    # then the faces
    for i in [0...pts]
        vertex_indices = []
        for j in [0...pts-i]
            if (!normal_flipped)    # reverse the orientation of the patch
                loc = b2i_i(i+1, j, pts-i-j-1, pts)
                vertex_indices.push(loc)
                
                #glNormal3dv(&(eval_N[loc*DIM]))
                #glVertex4dv(&(eval_P[loc*DIM]))

                loc = b2i_i(i, j, pts-i-j, pts)
                vertex_indices.push(loc)
                #glNormal3dv(&(eval_N[loc*DIM]))
                #glVertex4dv(&(eval_P[loc*DIM]))
            else
                loc = b2i_i(i, j, pts-i-j, pts)
                vertex_indices.push(loc)
                #glNormal3dv(&(eval_N[loc*DIM]))
                #glVertex4dv(&(eval_P[loc*DIM]))

                loc = b2i_i(i+1, j, pts-i-j-1, pts)
                #glNormal3dv(&(eval_N[loc*DIM]))
                #glVertex4dv(&(eval_P[loc*DIM]))
                vertex_indices.push(loc)


        # finish the strip by adding the last triangle
        loc = b2i_i(i, j, pts-i-j, pts)
        #glNormal3dv(&(eval_N[loc*DIM]))
        #glVertex4dv(&(eval_P[loc*DIM]))
        vertex_indices.push(loc)
        #console.log("Indices size: " + vertex_indices.length)

        # add the faces (triangles)
        for k in [0...vertex_indices.length-2]
            if (k % 2 == 1)
                v1 = vertex_indices[k]
                v2 = vertex_indices[k+1]
                v3 = vertex_indices[k+2]
            else
                v1 = vertex_indices[k+2]
                v2 = vertex_indices[k+1]
                v3 = vertex_indices[k]
            
            geo.faces.push(new THREE.Face3(v1, v2, v3, [eval_N[v1],eval_N[v2],eval_N[v3]]))
        #glEnd()

    # THREE.js calculated normals
    #geo.computeFaceNormals()
    #geo.computeVertexNormals()

    geo.rawP = eval_P
    geo.rawN = eval_N
    geo.rawCrv = crv_array

    return geo



# Evaluates tensor-product patches
# Types 4,5 and 8
eval_tensor_product = (patch, subDepth) ->
    type = patch.type
    vecs = patch.pts

    degu = patch.degu
    degv = patch.degv

    pts  = 1 << subDepth

    # allocate the memory for the result of evaluation
    C    = pts+1
    size = C*C;            # how big should the array be
    eval_P = new Array(size)
    eval_N = new Array(size)
    crv_array = new Array(size);  # 4 types of curvatures

    for i in [0...size]
        eval_P[i] = new THREE.Vector4()
        eval_N[i] = new THREE.Vector3()
        crv_array[i] = new THREE.Vector4()

#   use for crv needle, leave for future
#   #Jianwei
#   crv_filter = new Array(size);
#   for (var i=0; i<size; i++){
#   crv_filter[i] = false;
#   }

    # allocate a temporary memory to perform subdivision
    #    subdivision VS de Casteljau ??
    #
    #    now subdivision because the code already exists,
    #
    #    De Casteljau clearly do not need this temporary memory,
    #    but maybe slower compare to this code.
    #
    st = pts         # original space between two coefficients

    # it is set to 'pts' so that after subdivision
    # the memory becomes tight

    sizeu = st*degu  # size for both directions
    sizev = st*degv
    Cu = sizeu+1       # 0,0     ..  0,sizeu
    Cv = sizev+1       # sizev,0 .. sizev, sizev

    bb = new Array( Cu * Cv )
    for i in [0...bb.length]
        bb[i] = new THREE.Vector4()

    # BBcopy4(PAcopy4) -- copy the original data into the sparse array
    BBcopy4( vecs, degu, degv, pts, bb)

    # subdivision
    for i in [0...subDepth]
        RSubDiv(bb, st, degu, degv, sizeu,sizev)
        st = st/2  # distance halves after each subdivision

    #    bigstepu = st*degu    #  distance between patches -> column direction 
    #    bigstepv = st*degv    #  distance between patches -> row direction 

    bigstepu = degu    #  distance between patches -> column direction 
    bigstepv = degv    #  distance between patches -> row direction 

    # st==1
    for r in [0...sizev] by bigstepv  # row
        rs = r*Cu
        r1 = (r+st)*Cu
        r2 = (r+2*st)*Cu
        for c in [0...sizeu] by bigstepu   # column
            loc = (c/bigstepu*C + r/bigstepv)

            # curvature
            h = crv4(bb[rs+c],bb[rs+c+st],bb[rs+c+2*st], # curvature
                    bb[r1+c],bb[r2+c],bb[r1+c+st],degu, degv, crv_array[loc])

            evalPN(bb[rs+c], bb[r1+c], bb[rs+c+st], eval_P[loc], eval_N[loc])
            #printf (" %d %d %d %d %d %d \n", rs+c, rs+c+st, rs+c+2*st,
            #      r1+c, r2+c, r1+c+st);

        # last col _| note: stencil is rotated by 90 degrees c = sizeu;
        loc = (c/bigstepu*C + r/bigstepv)

        h =crv4(bb[rs+c],bb[r1+c],bb[r2+c], bb[rs+c-st],
                bb[rs+c-2*st],bb[r1+c-st],degv, degu, crv_array[loc])

        evalPN(bb[rs+c], bb[rs+c-st], bb[r1+c], eval_P[loc], eval_N[loc])

    # top row |-
    r = sizev
    rs = r*Cu
    r1 = (r-st)*Cu
    r2 = (r-2*st)*Cu
    for c in [0...sizeu] by bigstepu
        loc = (c/bigstepu*C + r/bigstepv)

        h =crv4(bb[rs+c],bb[r1+c],bb[r2+c], bb[rs+c+st],      # curvature
                bb[rs+c+2*st],bb[r1+c+st],degv, degu, crv_array[loc])

        evalPN(bb[rs+c], bb[rs+c+st], bb[r1+c], eval_P[loc],
                eval_N[loc])

    # top right -|
    c = sizeu
    loc = (c/bigstepu*C + r/bigstepv)

    h = crv4(bb[rs+c],bb[rs+c-st],bb[rs+c-2*st], bb[r1+c],  # curvature
            bb[r2+c], bb[r1+c-st],degu, degv, crv_array[loc])

    evalPN(bb[rs+c], bb[r1+c], bb[rs+c-st],  eval_P[loc], eval_N[loc])

#   # evaluate the artificial normals if necessary
#   if(art_normal && use_art_normal) {
#   printf("using artificial normals\n");
#   for(r=0;r<=pts;r++) {
#   double u = 1-(double)r/pts;
#   for(c=0;c<=pts;c++) {
#   double v = 1-(double)c/pts;
#   loc = r*C+c;
#   #printf("loc = %d, u=%f, v=%f\n", loc, u, v);
#   DeCastel2(norm, Ndegu, Ndegv, u, v, &eval_N[loc*DIM]);
#   Normalize(&eval_N[loc*DIM]);
#   }
#   }
#   }
#   # set the evaluated flag to be true
#   evaluated = true;
#   normal_flipped = false;

    #  copy from plot patch 

    geo = new THREE.Geometry()

    for i in [0...size]
        geo.vertices.push(new THREE.Vertex(eval_P[i]))

    normal_flipped = false
    for i in [0...pts]
        for j in [0...pts]       # this loop will draw the quad strip:
            v1 = i*(pts+1)+j
            v2 = (i+1)*(pts+1)+j
            v3 = (i+1)*(pts+1)+j+1
            v4 = i*(pts+1)+j+1
            if (v1 >= size || v2 >= size || v3>=size || v4 >= size)
                alert('error')
            if(!normal_flipped) # reverse the orientation of the patch
                face = new THREE.Face4(v1,v2,v3,v4, [eval_N[v1],eval_N[v2],eval_N[v3],eval_N[v4]])
                # face.vertexColors = color_array(v1,v2,v3,v4,crv_array)
            else
                face = new THREE.Face4(v4,v3,v2,v1, [eval_N[v4],eval_N[v3],eval_N[v2],eval_N[v1]])
                # face.vertexColors = color_array(v4,v3,v2,v1,crv_array)
            geo.faces.push(face)

    # keep a copy of the raw data
    geo.rawP = eval_P
    geo.rawN = eval_N
    geo.rawCrv = crv_array

    return geo


# * UTILITY FUNCTIONS *

# Mapping functions for triangular bezier surfaces
# barycentral coordinate mapping to 1d array index
# according to j & k
# i.e. when (i,j,k) has the property: (i+j+k<d)
#             (i,j,k)    will go to 
#              /
#          ((d-j-k), j, k)
# 
# this provides a certain way of overwriting points in DeCastejel
# algorithm, so that the intermediate values can be used to
# calculate derivatives and curvatures.

#                  /\ C(i,j,k+1)
#                 /  \
#                /    \
#               /      \      P will overwrite A
#              /    .   \
#             / P(i,j,k) \
#  A(i+1,j,k)/____________\ B(i,j+1,k)

b2i_i = (i, j, k, d) ->
    lk = 0
    kk = 0
    for kk in [0...k]
        lk += (d+1-kk)
    
    #console.log("Returning: " + (lk+j));
    return lk+j

# mapping function according to i & k
# i.e. when (i,j,k) has the property: (i+j+k<d)
#             (i,j,k)    will go to
#                \ 
#             (i, (d-i-k), k)
#  
# this provides another way of overwriting points in DeCasteljau
#  algorithm.
#  
#  P will overwrite B in same graph in b2i_i
b2i_j = (i, j, k, d) ->
    lk = 0
    kk = 0

    # d = i+j+k;
    for kk in [0...k]
        lk += (d+1-kk)
    #console.log("Returning: " + (lk+(d-i-k)));
    return lk + (d-i-k)

# mapping function according to j & i
# i.e. when (i,j,k) has the property: (i+j+k<d)
#                (i,j,(d-i-j))
#                 /
#             (i,j,k)    will go to
#
# this provides the third way of overwriting points in DeCasteljau
#  algorithm.
#  
#  P will overwrite C in same graph in b2i_i
#
b2i_k = (i, j, k, d) ->
    lk = 0
    kk = 0
    k = d-i-j

    for kk in [0...k]
        lk += (d+1-kk)
    #console.log("Returning: " + (lk+j));
    return lk+j


BBcopy4 = (buf, degu, degv, st, bb) ->
    # buf is arranged by
    #  columns -- v, rows -- u
    #    p11       p12    .... p1(degv+1)
    #    p21       p22    .... p2(degv+1)
    #     ..       ..     ....    ..
    # p(degu+1)1 p(degu+1)1 .. p(degu+1)(degv+1)

    C = st*degu + 1
    for i in [0..degu]
        for j in [0..degv]
            #double *v;
            #v = buf + (i*(degv+1) + j) * DIM;
            #Vcopy(v, bb[(j* st)* C + i*st]);

            bb[(j* st)* C + i*st].copy(buf[i*(degv+1) + j])



RSubDiv = (bb, step, degu, degv, sizeu, sizev) ->
    st2 = step/2
    bigstepu = step*degu
    bigstepv = step*degv
    C = sizeu+1

    for row in [0...sizev] by bigstepv   #  patch-level 
        for col in [0..sizeu] by step
            # subdivide a curve-column of degree degv 
            for l in [0...degv]    # levels of subdiv. triangle 
                h = row + l*st2
                for k in [0...degv-l]
                    h1= h + step
                    h2= h + st2
                    i1 = h2*C+col
                    i2 = h*C+col
                    i3 = h1*C+col
                    # bb[i1] = (bb[i2] + bb[i3])/2
                    bb[i1].add(bb[i2],bb[i3])
                    bb[i1].divideScalar(2.0)
                    # for m in [0...DIM]
                    # bb[i1][m] = (bb[i2][m] + bb[i3][m])/2
                    h = h1
    for col in [0...sizeu] by bigstepu   #  2 x patch-level 
        for row in [0..sizev] by st2
            # subdivide a curve-row of degree deg 
            for l in [0...degu]
                h = col + l*st2
                for k in [0...degu-l]
                    h1= h + step
                    h2= h + st2
                    i1 = row*C+h2
                    i2 = row*C+h
                    i3 = row*C+h1

                    # bb[i1] = (bb[i2] + bb[i3])/2
                    bb[i1].add(bb[i2],bb[i3])
                    bb[i1].divideScalar(2.0)

                    #for (m=0; m<DIM; m++)
                    #bb[i1][m] = (bb[i2][m] + bb[i3][m])/2
                    h = h1



# Cross product 
VVcross = (v1, v2) ->
    return new THREE.Vector4(
        (v1.y)*(v2.z) - (v1.z)*(v2.y),
        (v1.z)*(v2.x) - (v1.x)*(v2.z),
        (v1.x)*(v2.y) - (v1.y)*(v2.x),
        0.0
    )


evalPN = (v00, v01, v10, P, N) ->
    rv00 = v00.clone().divideScalar(v00.w)
    rv10 = v10.clone().divideScalar(v10.w)
    rv01 = v01.clone().divideScalar(v01.w)

    rv10.subSelf(rv00)
    rv01.subSelf(rv00)
    Normal = VVcross(rv10,rv01)
    Normal.normalize()
    N.set(Normal.x,Normal.y,Normal.z)
    P.copy(rv00)
    #console.log("Inside evalPN: " + P.x + ", " + P.y + ", " + P.z)
    #P.divideScalar(P.w)
