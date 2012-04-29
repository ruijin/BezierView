# File for reading the BezierView format
#
# Author(s):
# -Ruijin Wu (@ruijin)
# -Shayan Javed (@pixelperfect3)

# TODO:
# -Implement for all 10 types
# -Incorporate new format? 

# * The main read function *
read_patches_from_string = (str) ->
    parser = new bvFileParser(str)
    patches = []

    while parser.hasNext()
        # get the type
        type = parser.nextInt()
        #console.log("Type: " + type)
        
        # figure out which one to parse
        switch(type)
            when 1   # polyhedron
                patches.push(read_polyhedron(parser))
                break
            when 3   # triangular bezier
                patches.push(read_triangular(parser))
                break
            when 4, 5, 8 # tensor-product
                patches.push(read_tensor_product(type,parser))
                break
            else
                alert('unsupport format '+ type)
    return patches

# Handles polyhedron patch
# Type 1
#
# -Generates geometry directly
read_polyhedron = (parser) ->
    # number of faces and vertices
    numVertices = parser.nextInt()
    numFaces = parser.nextInt()

    # Construct the geometry directly
    geo = new THREE.Geometry()

    #console.log("NumFaces: " + numFaces + ",verts: " + numVertices)

    # all the vertices
    for i in [0...numVertices]
        geo.vertices.push(new THREE.Vertex(read_vec3(parser)))

    # all the faces
    for i in [0...numFaces]
        # TODO: For now can only handle faces with 3 or 4 vertices. Need to handle more?
        verts = parser.nextInt()

        # vertex indices
        v1 = parser.nextInt()
        v2 = parser.nextInt()
        v3 = parser.nextInt()

        if (verts == 3)
            geo.faces.push(new THREE.Face3(v1, v2, v3))
        else
            v4 = parser.nextInt()
            geo.faces.push(new THREE.Face4(v1, v2, v3, v4))

    # compute normals
    geo.computeFaceNormals()
    geo.computeVertexNormals()

    return {"type": 1, "geometry": geo}


# Handles triangular bezier patches
# Type 3
read_triangular = (parser) ->
    # The degree
    deg = parser.nextInt()
    #console.log("Degree: " + deg)
    
    # read all the control points
    vecs = []
    for i in [0...((deg+2) * (deg+1)/2)]
        vecs.push(read_vec3(parser))

    #console.log(vecs)
    return {"type":3,"deg":deg,"pts":vecs}


# Handles tensor-product patches
# Types 4, 5 and 8 for now 
read_tensor_product = (type,parser) ->
    # The degree in the u and v directionm
    if (type == 4)  # same degree in both directions
        degu = parser.nextInt()
        degv = degu
    else  # type (5) and (8) - general patch and rational tensor-product
        degu = parser.nextInt()
        degv = parser.nextInt()

    # read all the control points
    vecs = []
    for i in [0...(degu+1)*(degv+1)]
        if (type == 8)                # rational tensor-product: also has weight value 
            vecs.push(read_vec4(parser))
        else
            vecs.push(read_vec3(parser))

    return {"type":type,"degu":degu, "degv":degv, "pts":vecs}


# Methods for the parser object
class bvFileParser
    constructor: (str) ->
        @lines = str.split('\n')
        @stream = []
        for i in [0...@lines.length]
            line = trim(@lines[i])
            if(line.length == 0)
                continue
            segs = trim(line).split(/\s+/)

            # append all the segments
            @stream = @stream.concat(segs)
        #console.log(this.stream)
        @currentPos = 0

    hasNext: () -> return @currentPos < @stream.length

    nextToken: () ->
        last = @currentPos
        @currentPos = @currentPos + 1
        return @stream[last]

    nextInt : () -> parseInt(this.nextToken())
    nextFloat : () -> parseFloat(this.nextToken())


# * Utility functions *
read_vec3 = (parser) ->
    x = parser.nextFloat()
    y = parser.nextFloat()
    z = parser.nextFloat()
    #console.log("X = " + x  + ", Y = " + y + ", Z = " + z)
    return new THREE.Vector4(x,y,z,1.0)

read_vec4 = (parser) ->
    x = parser.nextFloat()
    y = parser.nextFloat()
    z = parser.nextFloat()
    w = parser.nextFloat()
    
    return new THREE.Vector4(x,y,z,w)

# trims the string
trim = (str) ->
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '')

