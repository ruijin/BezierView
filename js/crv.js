/*
Calculates the curvature for the surface

Author(s):
  Ruijin (@ruijin)
*/
var color_array, crv2color, crv3, crv4, crv_conv, det3, det4, freshObject, init_crv, krv, max_crv, min_crv, minmax, ratio_a, ratio_b;
freshObject = void 0;
min_crv = void 0;
max_crv = void 0;
ratio_a = 1;
ratio_b = 0;
det4 = function(x11, x12, x13, x14, x21, x22, x23, x24, x31, x32, x33, x34, x41, x42, x43, x44) {
  var t0;
  t0 = x11 * x22 * x33 * x44 - x11 * x22 * x34 * x43 - x11 * x32 * x23 * x44 + x11 * x32 * x24 * x43 + x11 * x42 * x23 * x34 - x11 * x42 * x24 * x33 - x21 * x12 * x33 * x44 + x21 * x12 * x34 * x43 + x21 * x32 * x13 * x44 - x21 * x32 * x14 * x43 - x21 * x42 * x13 * x34 + x21 * x42 * x14 * x33 + x31 * x12 * x23 * x44 - x31 * x12 * x24 * x43 - x31 * x22 * x13 * x44 + x31 * x22 * x14 * x43 + x31 * x42 * x13 * x24 - x31 * x42 * x14 * x23 - x41 * x12 * x23 * x34 + x41 * x12 * x24 * x33 + x41 * x22 * x13 * x34 - x41 * x22 * x14 * x33 - x41 * x32 * x13 * x24 + x41 * x32 * x14 * x23;
  return t0;
};
det3 = function(x11, x12, x13, x21, x22, x23, x31, x32, x33) {
  var t0;
  t0 = x11 * x22 * x33 - x11 * x23 * x32 - x12 * x21 * x33 + x12 * x23 * x31 + x13 * x21 * x32 - x13 * x22 * x31;
  return t0;
};
krv = function(v00, Deriv, crv_result) {
  var E, F, G, H, K, L, M, Max, Min, N, d, disc, du, duu, duv, dv, dvv, kes, m1, m2, m3, special_curvature, tol, x, xu, xuu, xuv, xv, xvv, y, yu, yuu, yuv, yv, yvv, z, zu, zuu, zuv, zv, zvv;
  x = v00.x;
  y = v00.y;
  z = v00.z;
  d = v00.w;
  xu = Deriv[1][0].x;
  yu = Deriv[1][0].y;
  zu = Deriv[1][0].z;
  du = Deriv[1][0].w;
  xuu = Deriv[2][0].x;
  yuu = Deriv[2][0].y;
  zuu = Deriv[2][0].z;
  duu = Deriv[2][0].w;
  xv = Deriv[0][1].x;
  yv = Deriv[0][1].y;
  zv = Deriv[0][1].z;
  dv = Deriv[0][1].w;
  xvv = Deriv[0][2].x;
  yvv = Deriv[0][2].y;
  zvv = Deriv[0][2].z;
  dvv = Deriv[0][2].w;
  xuv = Deriv[1][1].x;
  yuv = Deriv[1][1].y;
  zuv = Deriv[1][1].z;
  duv = Deriv[1][1].w;
  L = det4(xuu, yuu, zuu, duu, xu, yu, zu, du, xv, yv, zv, dv, x, y, z, d);
  N = det4(xvv, yvv, zvv, dvv, xu, yu, zu, du, xv, yv, zv, dv, x, y, z, d);
  M = det4(xuv, yuv, zuv, duv, xu, yu, zu, du, xv, yv, zv, dv, x, y, z, d);
  E = (xu * d - x * du) * (xu * d - x * du) + (yu * d - y * du) * (yu * d - y * du) + (zu * d - z * du) * (zu * d - z * du);
  G = (xv * d - x * dv) * (xv * d - x * dv) + (yv * d - y * dv) * (yv * d - y * dv) + (zv * d - z * dv) * (zv * d - z * dv);
  F = (xu * d - x * du) * (xv * d - x * dv) + (yu * d - y * du) * (yv * d - y * dv) + (zu * d - z * du) * (zv * d - z * dv);
  m1 = det3(y, z, d, yu, zu, du, yv, zv, dv);
  m2 = det3(x, z, d, xu, zu, du, xv, zv, dv);
  m3 = det3(x, y, d, xu, yu, du, xv, yv, dv);
  kes = m1 * m1 + m2 * m2 + m3 * m3;
  if (0) {
    K = H = Max = Min = 0;
  } else {
    K = d * d * d * d * (L * N - M * M) / (kes * kes);
    H = d * (L * G - 2 * M * F + N * E) / Math.sqrt(kes * kes * kes) / 2;
    disc = H * H - K;
    tol = 0.00001;
    if (disc < 0) {
      if (disc < -tol) {
        console.log("[krv] disc " + disc + " H " + H);
      }
      Max = Min = H;
    } else {
      disc = Math.sqrt(disc);
      Max = H + disc;
      Min = H - disc;
    }
  }
  crv_result.set(K, H, Max, Min);
  special_curvature = ratio_a * K + ratio_b * H * H;
  if (freshObject !== 0) {
    min_crv.w = special_curvature;
    max_crv.w = special_curvature;
  } else {
    max_crv.w = Math.max(max_crv.w, special_curvature);
    min_crv.w = Math.min(min_crv.w, special_curvature);
  }
  minmax(crv_result);
  return K;
};
minmax = function(curv) {
  if (freshObject !== 0) {
    max_crv.copy(curv);
    min_crv.copy(curv);
    return freshObject = 0;
  } else {
    max_crv.x = Math.max(max_crv.x, curv.x);
    max_crv.y = Math.max(max_crv.y, curv.y);
    max_crv.z = Math.max(max_crv.z, curv.z);
    max_crv.w = Math.max(max_crv.w, curv.w);
    min_crv.x = Math.min(min_crv.x, curv.x);
    min_crv.y = Math.min(min_crv.y, curv.y);
    min_crv.z = Math.min(min_crv.z, curv.z);
    return min_crv.w = Math.min(min_crv.w, curv.w);
  }
};
crv4 = function(v00, v01, v02, v10, v20, v11, degu, degv, crv_result) {
  var Deriv, degu1, degv1, i, j;
  Deriv = new Array(3);
  for (i = 0; i < 3; i++) {
    Deriv[i] = new Array(3);
    for (j = 0; j < 3; j++) {
      Deriv[i][j] = new THREE.Vector4();
    }
  }
  degu1 = degu - 1;
  degv1 = degv - 1;
  Deriv[0][1] = (v01.clone().subSelf(v00)).multiplyScalar(degu);
  if (degu1 === 0) {
    Deriv[0][2].set(0, 0, 0, 0);
  } else {
    Deriv[0][2] = (v02.clone().subSelf(v01.clone().multiplyScalar(2)).addSelf(v00)).multiplyScalar(degu * degu1);
  }
  Deriv[1][0] = (v10.clone().subSelf(v00)).multiplyScalar(degv);
  if (degv1 === 0) {
    Deriv[2][0].set(0, 0, 0, 0);
  } else {
    Deriv[2][0] = (v20.clone().subSelf(v10.clone().multiplyScalar(2)).addSelf(v00)).multiplyScalar(degv * degv1);
  }
  Deriv[1][1] = v11.clone().subSelf(v01).subSelf(v10).addSelf(v00).multiplyScalar(degv * degu);
  return krv(v00, Deriv, crv_result);
};
crv3 = function(v00, v10, v20, v01, v02, v11, deg, crv_result) {
  var Deriv, d1, i, j;
  Deriv = new Array(3);
  d1 = deg - 1;
  for (i = 0; i < 3; i++) {
    Deriv[i] = new Array(3);
    for (j = 0; j < 3; j++) {
      Deriv[i][j] = new THREE.Vector4();
    }
  }
  Deriv[1][0] = v10.clone().subSelf(v00).multiplyScalar(deg);
  Deriv[0][1] = v01.clone().subSelf(v00).multiplyScalar(deg);
  if (d1 === 0) {} else {
    Deriv[2][0] = v20.clone().subSelf(v10.clone().multiplyScalar(2)).addSelf(v00).multiplyScalar(deg * d1);
    Deriv[0][2] = v02.clone().subSelf(v01.clone().multiplyScalar(2)).addSelf(v00).multiplyScalar(deg * d1);
    Deriv[1][1] = v11.clone().subSelf(v01).subSelf(v10).addSelf(v00).multiplyScalar(deg * d1);
  }
  return krv(v00, Deriv, crv_result);
};
crv_conv = function(in_crv, hi, low) {
  var out, tol;
  tol = 0.0001;
  if (Math.abs(hi - low) < tol) {
    return 0.5;
  } else if (in_crv > hi) {
    out = 1;
  } else {
    if (in_crv < low) {
      out = 0;
    } else {
      out = (in_crv - low) / (hi - low);
    }
  }
  return out;
};
crv2color = function(in_crv, hi, low) {
  var color, crv_style, h;
  color = new THREE.Color(0xffffff);
  crv_style = 1;
  h = crv_conv(in_crv, hi, low);
  if (crv_style === 0) {
    color.setRGB(0.9, 0.9, 0.9);
    if ((0.101 > h && h > 0.09) || (0.201 > h && h > 0.19) || (0.301 > h && h > 0.29) || (0.401 > h && h > 0.39) || (0.501 > h && h > 0.49) || (0.601 > h && h > 0.59) || (0.701 > h && h > 0.69) || (0.801 > h && h > 0.79) || (0.901 > h && h > 0.89)) {
      color.setRGB(0, 0, 0);
    }
  } else if (crv_style === 1) {
    color.setHSV((1 - h) * 0.6, 1, 1);
  } else {
    color.setRGB(0.9 - 0.7 * h, 0.9 - 0.7 * h, 0.9 - 0.7 * h);
  }
  return color;
};
color_array = function(v1, v2, v3, v4, crv_array) {
  return [crv2color(crv_array[v1].x, max_crv.x, min_crv.x), crv2color(crv_array[v2].x, max_crv.x, min_crv.x), crv2color(crv_array[v3].x, max_crv.x, min_crv.x), crv2color(crv_array[v4].x, max_crv.x, min_crv.x)];
};
init_crv = function() {
  freshObject = 1;
  min_crv = new THREE.Vector4();
  return max_crv = new THREE.Vector4();
};