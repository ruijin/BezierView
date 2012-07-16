var animate, bicubic, bvstr, camera, control_meshes, control_object, controls, current_mesh, curvature_material, curvature_mesh, default_mesh, geometry, init, loadMesh, loadMeshFromFile, material, patch_mesh, patch_meshes, patch_object, pointLight, polyhedron, rational, regular_material, removeAllMeshes, render, render_mode, renderer, root_object, scene, setMesh, setPatchCurvatureRange, setRenderMode, setRendererSize, show_controlMesh, show_curvature, show_patch, subdivision_level, toggle_controlMeshes, toggle_patches, triangular;
camera = void 0;
scene = void 0;
renderer = void 0;
geometry = void 0;
material = void 0;
regular_material = void 0;
curvature_material = void 0;
controls = void 0;
pointLight = void 0;
patch_meshes = [];
control_meshes = [];
patch_mesh = void 0;
curvature_mesh = void 0;
current_mesh = void 0;
patch_object = void 0;
control_object = void 0;
root_object = void 0;
show_controlMesh = true;
show_patch = true;
show_curvature = false;
subdivision_level = 5;
bvstr = "";
polyhedron = "data/cube.bv";
default_mesh = polyhedron;
bicubic = "data/tp3x3.bv";
rational = "data/dtorus.bv";
triangular = "data/tri1.bv";
render_mode = bvPatch.Normal;
init = function(default_mesh) {
  var pointLight1, pointLight2;
  scene = new THREE.Scene();
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
  return renderer.domElement;
};
animate = function() {
  if (controls != null) {
    controls.update();
  }
  requestAnimationFrame(animate);
  return render();
};
render = function() {
  return renderer.render(scene, camera);
};
setMesh = function(file) {
  removeAllMeshes();
  return loadMeshFromFile(file);
};
removeAllMeshes = function() {
  return scene.remove(root_object);
};
loadMesh = function(data) {
  var box, boxsize, control_geometry, control_mesh, diameter, i, max, min, patches, radius, scale_ratio, _ref, _ref2;
  patches = read_patches_from_string(data);
  patch_meshes = [];
  control_meshes = [];
  patch_object = new THREE.Object3D();
  control_object = new THREE.Object3D();
  init_crv();
  for (i = 0, _ref = patches.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    patch_mesh = new bvPatch(patches[i], {
      subdivisionLevel: subdivision_level
    });
    patch_meshes.push(patch_mesh);
    patch_object.add(patch_mesh);
    if (patches[i].type === 1) {
      control_geometry = patches[i].geometry;
    } else if (patches[i].type === 3) {
      control_geometry = eval_control_mesh(patches[i].type, patches[i].deg, patches[i].pts);
    } else {
      control_geometry = eval_control_mesh(patches[i].type, [patches[i].degu, patches[i].degv], patches[i].pts);
    }
    control_mesh = new THREE.Mesh(control_geometry, new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true
    }));
    control_mesh.doubleSided = true;
    control_meshes.push(control_mesh);
    control_object.add(control_mesh);
    toggle_patches();
    toggle_controlMeshes();
    setRenderMode(render_mode);
  }
  root_object = new THREE.Object3D();
  root_object.add(patch_object);
  root_object.add(control_object);
  scene.add(root_object);
  controls = new THREE.ObjectControls(root_object, camera, renderer.domElement);
  controls.rotateSpeed = 0.2;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 1.0;
  controls.staticMoving = false;
  controls.dynamicDampingFactor = 0.8;
  radius = 2;
  controls.minDistance = radius * 1.1;
  controls.maxDistance = radius * 100;
  setPatchCurvatureRange([min_crv.x, min_crv.y, min_crv.z, min_crv.w], [max_crv.x, max_crv.y, max_crv.z, max_crv.w]);
  min = new THREE.Vector3();
  max = new THREE.Vector3();
  if (patch_meshes.length >= 1) {
    min.copy(patch_meshes[0].geometry.boundingBox.min);
    max.copy(patch_meshes[0].geometry.boundingBox.max);
    for (i = 1, _ref2 = patch_meshes.length; 1 <= _ref2 ? i < _ref2 : i > _ref2; 1 <= _ref2 ? i++ : i--) {
      box = patch_meshes[i].geometry.boundingBox;
      if (box.min.x < min.x) {
        min.x = box.min.x;
      }
      if (box.min.y < min.y) {
        min.y = box.min.y;
      }
      if (box.min.z < min.z) {
        min.z = box.min.z;
      }
      if (box.max.x > max.x) {
        max.x = box.max.x;
      }
      if (box.max.y > max.y) {
        max.y = box.max.y;
      }
      if (box.max.z > max.z) {
        max.z = box.max.z;
      }
    }
  }
  boxsize = max.subSelf(min);
  diameter = Math.max(boxsize.x, boxsize.y, boxsize.z);
  scale_ratio = 4.0 / diameter;
  return root_object.scale.set(scale_ratio, scale_ratio, scale_ratio);
};
loadMeshFromFile = function(file) {
  return $.get(file, function(data) {
    return loadMesh(data);
  }).error(function() {
    return alert('Error reading ' + file);
  });
};
setRenderMode = function(mode) {
  var i, _ref, _results;
  render_mode = mode;
  _results = [];
  for (i = 0, _ref = patch_meshes.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    _results.push(patch_meshes[i].setRenderMode(mode));
  }
  return _results;
};
toggle_controlMeshes = function(toggle) {
  if (toggle) {
    show_controlMesh = !show_controlMesh;
  }
  return THREE.SceneUtils.showHierarchy(control_object, show_controlMesh);
};
toggle_patches = function(toggle) {
  if (toggle) {
    show_patch = !show_patch;
  }
  return THREE.SceneUtils.showHierarchy(patch_object, show_patch);
};
setPatchCurvatureRange = function(minc, maxc) {
  var i, _ref, _results;
  _results = [];
  for (i = 0, _ref = patch_meshes.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    _results.push(patch_meshes[i].setCurvatureRange(minc, maxc));
  }
  return _results;
};
setRendererSize = function() {
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    return camera.updateProjectionMatrix();
  }
};