/*
The evaluation functions
*/
var BBcopy4, RSubDiv, VVcross, b2i_i, b2i_j, b2i_k, evalPN, eval_control_mesh, eval_patch, eval_tensor_product, eval_triangular;
eval_patch = function(patch, subDepth) {
  var type;
  type = patch.type;
  switch (type) {
    case 1:
      return patch.geometry;
    case 3:
      return eval_triangular(patch, subDepth);
    case 4:
    case 5:
    case 8:
      return eval_tensor_product(patch, subDepth);
    default:
      return alert('eval_patch: Unknown patch type ' + type);
  }
};
eval_control_mesh = function(type, degs, vecs) {
  var d, deg, degu, degv, geo, i, j, k, size, stepu, v1, v2, v3, v4, _ref, _ref2;
  geo = new THREE.Geometry();
  if (type === 3) {
    deg = degs;
    size = ((deg + 1) * (deg + 2)) / 2;
    for (i = 0; 0 <= size ? i < size : i > size; 0 <= size ? i++ : i--) {
      geo.vertices.push(new THREE.Vertex(vecs[i].clone()));
    }
    d = deg - 1;
    for (i = 0; 0 <= d ? i <= d : i >= d; 0 <= d ? i++ : i--) {
      for (j = 0, _ref = d - i; 0 <= _ref ? j <= _ref : j >= _ref; 0 <= _ref ? j++ : j--) {
        k = d - i - j;
        v1 = b2i_i(i + 1, j, k, deg);
        v2 = b2i_i(i, j + 1, k, deg);
        v3 = b2i_i(i, j, k + 1, deg);
        geo.faces.push(new THREE.Face3(v1, v2, v3));
      }
    }
  } else {
    degu = degs[0];
    degv = degs[1];
    for (i = 0, _ref2 = (degu + 1) * (degv + 1); 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
      if (type === 8) {
        geo.vertices.push(new THREE.Vertex(vecs[i].clone().divideScalar(vecs[i].w)));
      } else {
        geo.vertices.push(new THREE.Vertex(vecs[i].clone()));
      }
    }
    stepu = degu + 1;
    for (i = 0; 0 <= degu ? i < degu : i > degu; 0 <= degu ? i++ : i--) {
      for (j = 0; 0 <= degv ? j < degv : j > degv; 0 <= degv ? j++ : j--) {
        v1 = i * stepu + j;
        v2 = (i + 1) * stepu + j;
        v3 = (i + 1) * stepu + j + 1;
        v4 = i * stepu + j + 1;
        geo.faces.push(new THREE.Face4(v1, v2, v3, v4));
      }
    }
  }
  return geo;
};
eval_triangular = function(patch, subDepth) {
  var DIM, MAXDEG, V00, V01, V02, V10, V11, V20, atvtx, b2i, crv_array, d, deCastel, deg, eval_N, eval_P, geo, h, i, index, j, k, loc, normal_flipped, onbdy, point, pts, size, u, uu, v, v1, v2, v3, vertex_indices, vv, w, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
  loc = 0;
  deg = patch.deg;
  MAXDEG = deg;
  DIM = 4;
  deCastel = new Array((MAXDEG + 1) * (MAXDEG + 2) / 2);
  for (i = 0, _ref = (MAXDEG + 1) * (MAXDEG + 2) / 2; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    deCastel[i] = new THREE.Vector4();
  }
  pts = 1 << subDepth;
  size = (pts + 1) * (pts + 2) / 2;
  eval_P = new Array(size);
  eval_N = new Array(size);
  crv_array = new Array(size);
  for (i = 0; 0 <= size ? i < size : i > size; 0 <= size ? i++ : i--) {
    eval_P[i] = new THREE.Vector4();
    eval_N[i] = new THREE.Vector3();
    crv_array[i] = new THREE.Vector4();
  }
  for (uu = 0; 0 <= pts ? uu <= pts : uu >= pts; 0 <= pts ? uu++ : uu--) {
    for (vv = 0, _ref2 = pts - uu; 0 <= _ref2 ? vv <= _ref2 : vv >= _ref2; 0 <= _ref2 ? vv++ : vv--) {
      point = new THREE.Vector4();
      onbdy = uu === 0;
      atvtx = uu === 0 && vv === 0;
      u = uu / pts;
      v = vv / pts;
      w = 1 - u - v;
      if (atvtx) {
        b2i = b2i_k;
      } else if (onbdy) {
        b2i = b2i_j;
      } else {
        b2i = b2i_i;
      }
      for (i = 0; 0 <= deg ? i <= deg : i >= deg; 0 <= deg ? i++ : i--) {
        for (j = 0, _ref3 = deg - i; 0 <= _ref3 ? j <= _ref3 : j >= _ref3; 0 <= _ref3 ? j++ : j--) {
          k = deg - i - j;
          deCastel[b2i(i, j, k, deg)].copy(patch.pts[b2i(i, j, k, deg)]);
        }
      }
      for (d = _ref4 = deg - 1; d >= 1; d += -1) {
        for (k = 0; 0 <= d ? k <= d : k >= d; 0 <= d ? k++ : k--) {
          for (j = 0, _ref5 = d - k; 0 <= _ref5 ? j <= _ref5 : j >= _ref5; 0 <= _ref5 ? j++ : j--) {
            i = d - j - k;
            index = b2i(i, j, k, deg);
            deCastel[index].x = u * deCastel[b2i(i + 1, j, k, deg)].x + v * deCastel[b2i(i, j + 1, k, deg)].x + w * deCastel[b2i(i, j, k + 1, deg)].x;
            deCastel[index].y = u * deCastel[b2i(i + 1, j, k, deg)].y + v * deCastel[b2i(i, j + 1, k, deg)].y + w * deCastel[b2i(i, j, k + 1, deg)].y;
            deCastel[index].z = u * deCastel[b2i(i + 1, j, k, deg)].z + v * deCastel[b2i(i, j + 1, k, deg)].z + w * deCastel[b2i(i, j, k + 1, deg)].z;
          }
        }
      }
      point.x = u * deCastel[b2i(1, 0, 0, deg)].x + v * deCastel[b2i(0, 1, 0, deg)].x + w * deCastel[b2i(0, 0, 1, deg)].x;
      point.y = u * deCastel[b2i(1, 0, 0, deg)].y + v * deCastel[b2i(0, 1, 0, deg)].y + w * deCastel[b2i(0, 0, 1, deg)].y;
      point.z = u * deCastel[b2i(1, 0, 0, deg)].z + v * deCastel[b2i(0, 1, 0, deg)].z + w * deCastel[b2i(0, 0, 1, deg)].z;
      V00 = point;
      if (atvtx) {
        V01 = deCastel[b2i(0, 1, 0, deg)];
        V02 = deCastel[b2i(0, 2, 0, deg)];
        V10 = deCastel[b2i(1, 0, 0, deg)];
        V20 = deCastel[b2i(2, 0, 0, deg)];
        V11 = deCastel[b2i(1, 1, 0, deg)];
      } else if (onbdy) {
        V01 = deCastel[b2i(1, 0, 0, deg)];
        V02 = deCastel[b2i(2, 0, 0, deg)];
        V10 = deCastel[b2i(0, 0, 1, deg)];
        V20 = deCastel[b2i(0, 0, 2, deg)];
        V11 = deCastel[b2i(1, 0, 1, deg)];
      } else {
        V01 = deCastel[b2i(0, 0, 1, deg)];
        V02 = deCastel[b2i(0, 0, 2, deg)];
        V10 = deCastel[b2i(0, 1, 0, deg)];
        V20 = deCastel[b2i(0, 2, 0, deg)];
        V11 = deCastel[b2i(0, 1, 1, deg)];
      }
      evalPN(V00, V01, V10, eval_P[loc], eval_N[loc]);
      h = crv3(V00, V01, V02, V10, V20, V11, deg, crv_array[loc]);
      loc++;
    }
  }
  normal_flipped = false;
  geo = new THREE.Geometry();
  for (i = 0; 0 <= size ? i < size : i > size; 0 <= size ? i++ : i--) {
    geo.vertices.push(new THREE.Vertex(eval_P[i]));
  }
  for (i = 0; 0 <= pts ? i < pts : i > pts; 0 <= pts ? i++ : i--) {
    vertex_indices = [];
    for (j = 0, _ref6 = pts - i; 0 <= _ref6 ? j < _ref6 : j > _ref6; 0 <= _ref6 ? j++ : j--) {
      if (!normal_flipped) {
        loc = b2i_i(i + 1, j, pts - i - j - 1, pts);
        vertex_indices.push(loc);
        loc = b2i_i(i, j, pts - i - j, pts);
        vertex_indices.push(loc);
      } else {
        loc = b2i_i(i, j, pts - i - j, pts);
        vertex_indices.push(loc);
        loc = b2i_i(i + 1, j, pts - i - j - 1, pts);
        vertex_indices.push(loc);
      }
    }
    loc = b2i_i(i, j, pts - i - j, pts);
    vertex_indices.push(loc);
    for (k = 0, _ref7 = vertex_indices.length - 2; 0 <= _ref7 ? k < _ref7 : k > _ref7; 0 <= _ref7 ? k++ : k--) {
      if (k % 2 === 1) {
        v1 = vertex_indices[k];
        v2 = vertex_indices[k + 1];
        v3 = vertex_indices[k + 2];
      } else {
        v1 = vertex_indices[k + 2];
        v2 = vertex_indices[k + 1];
        v3 = vertex_indices[k];
      }
      geo.faces.push(new THREE.Face3(v1, v2, v3, [eval_N[v1], eval_N[v2], eval_N[v3]]));
    }
  }
  geo.rawP = eval_P;
  geo.rawN = eval_N;
  geo.rawCrv = crv_array;
  return geo;
};
eval_tensor_product = function(patch, subDepth) {
  var C, Cu, Cv, bb, bigstepu, bigstepv, c, crv_array, degu, degv, eval_N, eval_P, face, geo, h, i, j, loc, normal_flipped, pts, r, r1, r2, rs, size, sizeu, sizev, st, type, v1, v2, v3, v4, vecs, _ref;
  type = patch.type;
  vecs = patch.pts;
  degu = patch.degu;
  degv = patch.degv;
  pts = 1 << subDepth;
  C = pts + 1;
  size = C * C;
  eval_P = new Array(size);
  eval_N = new Array(size);
  crv_array = new Array(size);
  for (i = 0; 0 <= size ? i < size : i > size; 0 <= size ? i++ : i--) {
    eval_P[i] = new THREE.Vector4();
    eval_N[i] = new THREE.Vector3();
    crv_array[i] = new THREE.Vector4();
  }
  st = pts;
  sizeu = st * degu;
  sizev = st * degv;
  Cu = sizeu + 1;
  Cv = sizev + 1;
  bb = new Array(Cu * Cv);
  for (i = 0, _ref = bb.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    bb[i] = new THREE.Vector4();
  }
  BBcopy4(vecs, degu, degv, pts, bb);
  for (i = 0; 0 <= subDepth ? i < subDepth : i > subDepth; 0 <= subDepth ? i++ : i--) {
    RSubDiv(bb, st, degu, degv, sizeu, sizev);
    st = st / 2;
  }
  bigstepu = degu;
  bigstepv = degv;
  for (r = 0; 0 <= sizev ? r < sizev : r > sizev; r += bigstepv) {
    rs = r * Cu;
    r1 = (r + st) * Cu;
    r2 = (r + 2 * st) * Cu;
    for (c = 0; 0 <= sizeu ? c < sizeu : c > sizeu; c += bigstepu) {
      loc = c / bigstepu * C + r / bigstepv;
      h = crv4(bb[rs + c], bb[rs + c + st], bb[rs + c + 2 * st], bb[r1 + c], bb[r2 + c], bb[r1 + c + st], degu, degv, crv_array[loc]);
      evalPN(bb[rs + c], bb[r1 + c], bb[rs + c + st], eval_P[loc], eval_N[loc]);
    }
    loc = c / bigstepu * C + r / bigstepv;
    h = crv4(bb[rs + c], bb[r1 + c], bb[r2 + c], bb[rs + c - st], bb[rs + c - 2 * st], bb[r1 + c - st], degv, degu, crv_array[loc]);
    evalPN(bb[rs + c], bb[rs + c - st], bb[r1 + c], eval_P[loc], eval_N[loc]);
  }
  r = sizev;
  rs = r * Cu;
  r1 = (r - st) * Cu;
  r2 = (r - 2 * st) * Cu;
  for (c = 0; 0 <= sizeu ? c < sizeu : c > sizeu; c += bigstepu) {
    loc = c / bigstepu * C + r / bigstepv;
    h = crv4(bb[rs + c], bb[r1 + c], bb[r2 + c], bb[rs + c + st], bb[rs + c + 2 * st], bb[r1 + c + st], degv, degu, crv_array[loc]);
    evalPN(bb[rs + c], bb[rs + c + st], bb[r1 + c], eval_P[loc], eval_N[loc]);
  }
  c = sizeu;
  loc = c / bigstepu * C + r / bigstepv;
  h = crv4(bb[rs + c], bb[rs + c - st], bb[rs + c - 2 * st], bb[r1 + c], bb[r2 + c], bb[r1 + c - st], degu, degv, crv_array[loc]);
  evalPN(bb[rs + c], bb[r1 + c], bb[rs + c - st], eval_P[loc], eval_N[loc]);
  geo = new THREE.Geometry();
  for (i = 0; 0 <= size ? i < size : i > size; 0 <= size ? i++ : i--) {
    geo.vertices.push(new THREE.Vertex(eval_P[i]));
  }
  normal_flipped = false;
  for (i = 0; 0 <= pts ? i < pts : i > pts; 0 <= pts ? i++ : i--) {
    for (j = 0; 0 <= pts ? j < pts : j > pts; 0 <= pts ? j++ : j--) {
      v1 = i * (pts + 1) + j;
      v2 = (i + 1) * (pts + 1) + j;
      v3 = (i + 1) * (pts + 1) + j + 1;
      v4 = i * (pts + 1) + j + 1;
      if (v1 >= size || v2 >= size || v3 >= size || v4 >= size) {
        alert('error');
      }
      if (!normal_flipped) {
        face = new THREE.Face4(v1, v2, v3, v4, [eval_N[v1], eval_N[v2], eval_N[v3], eval_N[v4]]);
      } else {
        face = new THREE.Face4(v4, v3, v2, v1, [eval_N[v4], eval_N[v3], eval_N[v2], eval_N[v1]]);
      }
      geo.faces.push(face);
    }
  }
  geo.rawP = eval_P;
  geo.rawN = eval_N;
  geo.rawCrv = crv_array;
  return geo;
};
b2i_i = function(i, j, k, d) {
  var kk, lk;
  lk = 0;
  kk = 0;
  for (kk = 0; 0 <= k ? kk < k : kk > k; 0 <= k ? kk++ : kk--) {
    lk += d + 1 - kk;
  }
  return lk + j;
};
b2i_j = function(i, j, k, d) {
  var kk, lk;
  lk = 0;
  kk = 0;
  for (kk = 0; 0 <= k ? kk < k : kk > k; 0 <= k ? kk++ : kk--) {
    lk += d + 1 - kk;
  }
  return lk + (d - i - k);
};
b2i_k = function(i, j, k, d) {
  var kk, lk;
  lk = 0;
  kk = 0;
  k = d - i - j;
  for (kk = 0; 0 <= k ? kk < k : kk > k; 0 <= k ? kk++ : kk--) {
    lk += d + 1 - kk;
  }
  return lk + j;
};
BBcopy4 = function(buf, degu, degv, st, bb) {
  var C, i, j, _results;
  C = st * degu + 1;
  _results = [];
  for (i = 0; 0 <= degu ? i <= degu : i >= degu; 0 <= degu ? i++ : i--) {
    _results.push((function() {
      var _results2;
      _results2 = [];
      for (j = 0; 0 <= degv ? j <= degv : j >= degv; 0 <= degv ? j++ : j--) {
        _results2.push(bb[(j * st) * C + i * st].copy(buf[i * (degv + 1) + j]));
      }
      return _results2;
    })());
  }
  return _results;
};
RSubDiv = function(bb, step, degu, degv, sizeu, sizev) {
  var C, bigstepu, bigstepv, col, h, h1, h2, i1, i2, i3, k, l, row, st2, _ref, _results;
  st2 = step / 2;
  bigstepu = step * degu;
  bigstepv = step * degv;
  C = sizeu + 1;
  for (row = 0; 0 <= sizev ? row < sizev : row > sizev; row += bigstepv) {
    for (col = 0; 0 <= sizeu ? col <= sizeu : col >= sizeu; col += step) {
      for (l = 0; 0 <= degv ? l < degv : l > degv; 0 <= degv ? l++ : l--) {
        h = row + l * st2;
        for (k = 0, _ref = degv - l; 0 <= _ref ? k < _ref : k > _ref; 0 <= _ref ? k++ : k--) {
          h1 = h + step;
          h2 = h + st2;
          i1 = h2 * C + col;
          i2 = h * C + col;
          i3 = h1 * C + col;
          bb[i1].add(bb[i2], bb[i3]);
          bb[i1].divideScalar(2.0);
          h = h1;
        }
      }
    }
  }
  _results = [];
  for (col = 0; 0 <= sizeu ? col < sizeu : col > sizeu; col += bigstepu) {
    _results.push((function() {
      var _results2;
      _results2 = [];
      for (row = 0; 0 <= sizev ? row <= sizev : row >= sizev; row += st2) {
        _results2.push((function() {
          var _results3;
          _results3 = [];
          for (l = 0; 0 <= degu ? l < degu : l > degu; 0 <= degu ? l++ : l--) {
            h = col + l * st2;
            _results3.push((function() {
              var _ref2, _results4;
              _results4 = [];
              for (k = 0, _ref2 = degu - l; 0 <= _ref2 ? k < _ref2 : k > _ref2; 0 <= _ref2 ? k++ : k--) {
                h1 = h + step;
                h2 = h + st2;
                i1 = row * C + h2;
                i2 = row * C + h;
                i3 = row * C + h1;
                bb[i1].add(bb[i2], bb[i3]);
                bb[i1].divideScalar(2.0);
                _results4.push(h = h1);
              }
              return _results4;
            })());
          }
          return _results3;
        })());
      }
      return _results2;
    })());
  }
  return _results;
};
VVcross = function(v1, v2) {
  return new THREE.Vector4(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x, 0.0);
};
evalPN = function(v00, v01, v10, P, N) {
  var Normal, rv00, rv01, rv10;
  rv00 = v00.clone().divideScalar(v00.w);
  rv10 = v10.clone().divideScalar(v10.w);
  rv01 = v01.clone().divideScalar(v01.w);
  rv10.subSelf(rv00);
  rv01.subSelf(rv00);
  Normal = VVcross(rv10, rv01);
  Normal.normalize();
  N.set(Normal.x, Normal.y, Normal.z);
  return P.copy(rv00);
};