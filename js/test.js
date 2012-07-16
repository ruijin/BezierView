var animate, bvstr, camera, controls, current_mesh, curvature_material, curvature_mesh, geometry, init, material, patch_mesh, patch_mesh_list, pointLight, regular_material, render, renderer, scene, setHLStep, setPatchCurvatureRange, setPatchRenderMode, show_controlMesh, show_curvature, show_patch, test_url, toggle_controlMesh, toggle_curvature, toggle_highlight, toggle_patches;
camera = void 0;
scene = void 0;
renderer = void 0;
geometry = void 0;
material = void 0;
regular_material = void 0;
curvature_material = void 0;
controls = void 0;
pointLight = void 0;
patch_mesh = void 0;
patch_mesh_list = void 0;
curvature_mesh = void 0;
current_mesh = void 0;
show_controlMesh = true;
show_patch = true;
show_curvature = false;
bvstr = "";
test_url = "data/dtorus.bv";
$.get(test_url, function(data) {
  bvstr = data;
  init();
  return animate();
}).error(function() {
  return alert('Error reading ' + test_url);
});
init = function() {
  var i, patch, patches, pointLight1, pointLight2, radius, _ref;
  scene = new THREE.Scene();
  patches = read_patches_from_string(bvstr);
  patch_mesh_list = [];
  init_crv();
  for (i = 0, _ref = patches.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    patch = patches[i];
    patch_mesh = new bvPatch(patch, {
      subdivisionLevel: 5
    });
    scene.add(patch_mesh);
    patch_mesh_list.push(patch_mesh);
    current_mesh = patch_mesh;
  }
  setPatchCurvatureRange([min_crv.x, min_crv.y, min_crv.z, min_crv.w], [max_crv.x, max_crv.y, max_crv.z, max_crv.w]);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
  camera.position.z = 6;
  scene.add(camera);
  pointLight1 = new THREE.PointLight(0xffffff);
  pointLight1.position.x = 360;
  pointLight1.position.z = 360;
  scene.add(pointLight1);
  pointLight2 = new THREE.PointLight(0xffffff);
  pointLight2.position.x = -360;
  pointLight2.position.z = 0;
  scene.add(pointLight2);
  renderer = new THREE.WebGLRenderer();
  renderer.sortObjects = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setFaceCulling(false);
  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.2;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = false;
  controls.dynamicDampingFactor = 0.3;
  radius = 2;
  controls.minDistance = radius * 1.1;
  controls.maxDistance = radius * 100;
  return document.body.appendChild(renderer.domElement);
};
animate = function() {
  controls.update();
  requestAnimationFrame(animate);
  return render();
};
render = function() {
  return renderer.render(scene, camera);
};
$(document).keypress(function(evt) {
  var ch;
  ch = String.fromCharCode(evt.keyCode);
  switch (ch) {
    case 'm':
      toggle_controlMesh();
      break;
    case 'p':
      toggle_patches();
      break;
    case 'c':
      toggle_curvature();
      break;
    default:
      break;
  }
});
toggle_controlMesh = function() {
  show_controlMesh = !show_controlMesh;
  if (show_controlMesh) {
    return control_mesh.visible = true;
  } else {
    return control_mesh.visible = false;
  }
};
toggle_patches = function() {
  show_patch = !show_patch;
  if (show_patch) {
    return current_mesh.visible = true;
  } else {
    return current_mesh.visible = false;
  }
};
toggle_curvature = function() {
  show_curvature = !show_curvature;
  current_mesh.visible = false;
  if (show_curvature) {
    current_mesh = curvature_mesh;
  } else {
    current_mesh = patch_mesh;
  }
  if (show_patch) {
    return current_mesh.visible = true;
  }
};
toggle_highlight = function() {
  if (current_mesh.getRenderMode() === bvPatch.HighlightLine) {
    return current_mesh.setRenderMode(bvPatch.ReflectionLine);
  } else {
    return current_mesh.setRenderMode(bvPatch.HighlightLine);
  }
};
setPatchRenderMode = function(mode) {
  var i, _ref, _results;
  _results = [];
  for (i = 0, _ref = patch_mesh_list.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    _results.push(patch_mesh_list[i].setRenderMode(mode));
  }
  return _results;
};
setPatchCurvatureRange = function(minc, maxc) {
  var i, _ref, _results;
  _results = [];
  for (i = 0, _ref = patch_mesh_list.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    _results.push(patch_mesh_list[i].setCurvatureRange(minc, maxc));
  }
  return _results;
};
setHLStep = function(step) {
  var i, _ref, _results;
  _results = [];
  for (i = 0, _ref = patch_mesh_list.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    patch_mesh_list[i].hl_step = step;
    _results.push(patch_mesh_list[i].updateAttributes());
  }
  return _results;
};