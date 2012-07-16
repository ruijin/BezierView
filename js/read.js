var bvFileParser, read_patches_from_string, read_polyhedron, read_tensor_product, read_triangular, read_vec3, read_vec4, trim;
read_patches_from_string = function(str) {
  var parser, patches, type;
  parser = new bvFileParser(str);
  patches = [];
  while (parser.hasNext()) {
    type = parser.nextInt();
    switch (type) {
      case 1:
        patches.push(read_polyhedron(parser));
        break;
      case 3:
        patches.push(read_triangular(parser));
        break;
      case 4:
      case 5:
      case 8:
        patches.push(read_tensor_product(type, parser));
        break;
      default:
        alert('unsupport format ' + type);
    }
  }
  return patches;
};
read_polyhedron = function(parser) {
  var geo, i, numFaces, numVertices, v1, v2, v3, v4, verts;
  numVertices = parser.nextInt();
  numFaces = parser.nextInt();
  geo = new THREE.Geometry();
  for (i = 0; 0 <= numVertices ? i < numVertices : i > numVertices; 0 <= numVertices ? i++ : i--) {
    geo.vertices.push(new THREE.Vertex(read_vec3(parser)));
  }
  for (i = 0; 0 <= numFaces ? i < numFaces : i > numFaces; 0 <= numFaces ? i++ : i--) {
    verts = parser.nextInt();
    v1 = parser.nextInt();
    v2 = parser.nextInt();
    v3 = parser.nextInt();
    if (verts === 3) {
      geo.faces.push(new THREE.Face3(v1, v2, v3));
    } else {
      v4 = parser.nextInt();
      geo.faces.push(new THREE.Face4(v1, v2, v3, v4));
    }
  }
  geo.computeFaceNormals();
  geo.computeVertexNormals();
  return {
    "type": 1,
    "geometry": geo
  };
};
read_triangular = function(parser) {
  var deg, i, vecs, _ref;
  deg = parser.nextInt();
  vecs = [];
  for (i = 0, _ref = (deg + 2) * (deg + 1) / 2; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    vecs.push(read_vec3(parser));
  }
  return {
    "type": 3,
    "deg": deg,
    "pts": vecs
  };
};
read_tensor_product = function(type, parser) {
  var degu, degv, i, vecs, _ref;
  if (type === 4) {
    degu = parser.nextInt();
    degv = degu;
  } else {
    degu = parser.nextInt();
    degv = parser.nextInt();
  }
  vecs = [];
  for (i = 0, _ref = (degu + 1) * (degv + 1); 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    if (type === 8) {
      vecs.push(read_vec4(parser));
    } else {
      vecs.push(read_vec3(parser));
    }
  }
  return {
    "type": type,
    "degu": degu,
    "degv": degv,
    "pts": vecs
  };
};
bvFileParser = (function() {
  function bvFileParser(str) {
    var i, line, segs, _ref;
    this.lines = str.split('\n');
    this.stream = [];
    for (i = 0, _ref = this.lines.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      line = trim(this.lines[i]);
      if (line.length === 0) {
        continue;
      }
      segs = trim(line).split(/\s+/);
      this.stream = this.stream.concat(segs);
    }
    this.currentPos = 0;
  }
  bvFileParser.prototype.hasNext = function() {
    return this.currentPos < this.stream.length;
  };
  bvFileParser.prototype.nextToken = function() {
    var last;
    last = this.currentPos;
    this.currentPos = this.currentPos + 1;
    return this.stream[last];
  };
  bvFileParser.prototype.nextInt = function() {
    return parseInt(this.nextToken());
  };
  bvFileParser.prototype.nextFloat = function() {
    return parseFloat(this.nextToken());
  };
  return bvFileParser;
})();
read_vec3 = function(parser) {
  var x, y, z;
  x = parser.nextFloat();
  y = parser.nextFloat();
  z = parser.nextFloat();
  return new THREE.Vector4(x, y, z, 1.0);
};
read_vec4 = function(parser) {
  var w, x, y, z;
  x = parser.nextFloat();
  y = parser.nextFloat();
  z = parser.nextFloat();
  w = parser.nextFloat();
  return new THREE.Vector4(x, y, z, w);
};
trim = function(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};