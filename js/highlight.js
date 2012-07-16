/*
Calculates the highlight/reflection lines

Author(s):
  Ruijin (@ruijin)
*/
var HIGHLIGHTLINE, REFLECTLINE, Solve4, calc_D, calc_HA, calc_ref_line, det4, eval_highlight, hl_error, hl_step;
hl_error = null;
hl_step = 5.0;
HIGHLIGHTLINE = 0;
REFLECTLINE = 1;
calc_D = function(p, n, a, h) {
  var div, sa, temp, tol;
  sa = new THREE.Vector4();
  sa.sub(a, p);
  temp = VVcross(H, N);
  div = temp.length();
  tol = 0.0001;
  if (Math.abs(div) < tol) {
    hl_error = 1;
    return 0;
  } else {
    hl_error = 0;
    return temp.dot(SA) / div;
  }
};
calc_ref_line = function(P, N, A, H, eye) {
  var RefN, SA, th;
  SA = new THREE.Vector3();
  SA.sub(A, P);
  SA.divideScalar(SA.length());
  th = SA.dot(N);
  RefN = N.clone().multiplyScalar(2 * th).subSelf(SA);
  return calc_D(P, RefN, A, H);
};
det4 = function(x11, x12, x13, x14, x21, x22, x23, x24, x31, x32, x33, x34, x41, x42, x43, x44) {
  var t0;
  t0 = x11 * x22 * x33 * x44 - x11 * x22 * x34 * x43 - x11 * x32 * x23 * x44 + x11 * x32 * x24 * x43 + x11 * x42 * x23 * x34 - x11 * x42 * x24 * x33 - x21 * x12 * x33 * x44 + x21 * x12 * x34 * x43 + x21 * x32 * x13 * x44 - x21 * x32 * x14 * x43 - x21 * x42 * x13 * x34 + x21 * x42 * x14 * x33 + x31 * x12 * x23 * x44 - x31 * x12 * x24 * x43 - x31 * x22 * x13 * x44 + x31 * x22 * x14 * x43 + x31 * x42 * x13 * x24 - x31 * x42 * x14 * x23 - x41 * x12 * x23 * x34 + x41 * x12 * x24 * x33 + x41 * x22 * x13 * x34 - x41 * x22 * x14 * x33 - x41 * x32 * x13 * x24 + x41 * x32 * x14 * x23;
  return t0;
};
Solve4 = function(A, x) {
  var B, dem, det, i, j, y, _results;
  B = new Array(16);
  y = new Array(4);
  det = det4(A[0], A[4], A[8], A[12], A[1], A[5], A[9], A[13], A[2], A[6], A[10], A[14], A[3], A[7], A[11], A[15]);
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 16; j++) {
      B[j] = A[j];
    }
    for (j = 0; j < 4; j++) {
      B[i * 4 + j] = x[j];
    }
    dem = det4(B[0], B[4], B[8], B[12], B[1], B[5], B[9], B[13], B[2], B[6], B[10], B[14], B[3], B[7], B[11], B[15]);
    y[i] = dem / det;
  }
  _results = [];
  for (i = 0; i < 4; i++) {
    _results.push(x[i] = y[i]);
  }
  return _results;
};
calc_HA = function(patch, A, H) {
  var array_A, array_H, eye, mv_matrix, temp_matrix;
  array_A = [0.0, 0.0, 40.0, 1.0];
  array_H = [0.0, 1.0, 0.0, 0.0];
  mv_matrix = new Array(16);
  eye = new THREE.Vector4(0, 0, 1000, 1);
  if (!(patch._modelViewMatrix != null)) {
    temp_matrix = new THREE.Matrix4();
    temp_matrix.flattenToArray(mv_matrix);
  } else {
    patch._modelViewMatrix.flattenToArray(mv_matrix);
  }
  Solve4(mv_matrix, array_A);
  Solve4(mv_matrix, array_H);
  A.set(array_A[0], array_A[1], array_A[2], array_A[3]);
  return H.set(array_H[0], array_H[1], array_H[2], array_H[3]);
};
eval_highlight = function(highlight_type, patch, funcs) {
  var A, H, N, P, eye, face, func, i, ids, j, _ref, _results;
  eye = new THREE.Vector4(0, 0, 1000, 1);
  A = new THREE.Vector4();
  H = new THREE.Vector4();
  calc_HA(patch, A, H);
  _results = [];
  for (i = 0, _ref = patch.geometry.faces.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    face = patch.geometry.faces[i];
    ids = [face.a, face.b, face.c, face.d];
    for (j = 0; j < 4; j++) {
      N = face.vertexNormals[j];
      P = patch.geometry.vertices[ids[j]].position.clone();
      if (highlight_type === HIGHLIGHTLINE) {
        func = calc_D(P, N, A, H) / hl_step;
        if (hl_error) {
          console.log('hl_error');
          return;
        }
      } else {
        func = calc_ref_line(P, N, A, H, eye) / hl_step;
        if (hl_error) {
          console.log('hl_error');
          return;
        }
      }
      funcs[ids[j]] = func;
    }
  }
  return _results;
};