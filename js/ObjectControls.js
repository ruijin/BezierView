/*
Controller that moves the object instead of the camera

Modified from the TrackBallControls in Three.js

Author: Ruijin Wu <cszwrj at gmail.com>
*/
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
THREE.ObjectControls = function(object, camera, domElement) {
  var STATE, keydown, keyup, mousedown, mousemove, mouseup, _eye, _keyPressed, _panEnd, _panStart, _rotateEnd, _rotateStart, _state, _zoomEnd, _zoomStart;
  STATE = {
    NONE: -1,
    ROTATE: 0,
    ZOOM: 1,
    PAN: 2
  };
  this.object = object;
  object.useQuaternion = true;
  this.camera = camera;
  this.domElement = domElement != null ? domElement : document;
  this.enabled = true;
  this.screen = {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0
  };
  this.radius = (this.screen.width + this.screen.height) / 4;
  this.rotateSpeed = 1.0;
  this.zoomSpeed = 1.2;
  this.panSpeed = 0.3;
  this.noRotate = false;
  this.noZoom = false;
  this.noPan = false;
  this.staticMoving = false;
  this.dynamicDampingFactor = 0.2;
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.keys = [65, 83, 68];
  this.target = new THREE.Vector3(0, 0, 0);
  _keyPressed = false;
  _state = STATE.NONE;
  _eye = new THREE.Vector3();
  _rotateStart = new THREE.Vector3();
  _rotateEnd = new THREE.Vector3();
  _zoomStart = new THREE.Vector2();
  _zoomEnd = new THREE.Vector2();
  _panStart = new THREE.Vector2();
  _panEnd = new THREE.Vector2();
  this.handleEvent = __bind(function(event) {
    if (typeof this[event.type] === 'function') {
      return this[event.type](event);
    }
  }, this);
  this.getMouseOnScreen = __bind(function(clientX, clientY) {
    return new THREE.Vector2((clientX - this.screen.offsetLeft) / this.radius * 0.5, (clientY - this.screen.offsetTop) / this.radius * 0.5);
  }, this);
  this.getMouseProjectionOnBall = __bind(function(clientX, clientY) {
    var length, mouseOnBall, projection;
    mouseOnBall = new THREE.Vector3((clientX - this.screen.width * 0.5 - this.screen.offsetLeft) / this.radius, (this.screen.height * 0.5 + this.screen.offsetTop - clientY) / this.radius, 0.0);
    length = mouseOnBall.length();
    if (length > 1.0) {
      mouseOnBall.normalize();
    } else {
      mouseOnBall.z = Math.sqrt(1.0 - length * length);
    }
    _eye.copy(this.camera.position).subSelf(this.target);
    projection = this.camera.up.clone().setLength(mouseOnBall.y);
    projection.addSelf(this.camera.up.clone().crossSelf(_eye).setLength(mouseOnBall.x));
    projection.addSelf(_eye.setLength(mouseOnBall.z));
    return projection;
  }, this);
  this.rotateObject = __bind(function() {
    var angle, axis, quaternion, tQuaternion;
    angle = Math.acos(_rotateStart.dot(_rotateEnd) / _rotateStart.length() / _rotateEnd.length());
    if (angle) {
      axis = (new THREE.Vector3()).cross(_rotateStart, _rotateEnd).normalize();
      quaternion = new THREE.Quaternion();
      angle *= this.rotateSpeed;
      tQuaternion = new THREE.Quaternion();
      tQuaternion.setFromAxisAngle(axis, angle);
      this.object.quaternion.multiply(tQuaternion, this.object.quaternion);
      this.object.quaternion.normalize();
      quaternion.setFromAxisAngle(axis, -angle);
      quaternion.multiplyVector3(_rotateEnd);
      if (this.staticMoving) {
        return _rotateStart = _rotateEnd;
      } else {
        quaternion.setFromAxisAngle(axis, angle * (this.dynamicDampingFactor - 1.0));
        return quaternion.multiplyVector3(_rotateStart);
      }
    }
  }, this);
  this.zoomObject = __bind(function() {
    var factor;
    factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * this.zoomSpeed;
    if (factor !== 1.0 && factor > 0.0) {
      this.object.scale.divideScalar(factor);
      if (this.staticMoving) {
        return _zoomStart = _zoomEnd;
      } else {
        return _zoomStart.y += (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor;
      }
    }
  }, this);
  this.panObject = __bind(function() {
    var mouseChange, pan;
    mouseChange = _panEnd.clone().subSelf(_panStart);
    if (mouseChange.lengthSq()) {
      mouseChange.multiplyScalar(_eye.length() * this.panSpeed);
      pan = _eye.clone().crossSelf(this.object.up).setLength(mouseChange.x);
      pan.addSelf(this.object.up.clone().setLength(mouseChange.y));
      this.object.position.subSelf(pan);
      if (this.staticMoving) {
        return _panStart = _panEnd;
      } else {
        return _panStart.addSelf(mouseChange.sub(_panEnd, _panStart).multiplyScalar(this.dynamicDampingFactor));
      }
    }
  }, this);
  this.update = __bind(function() {
    if (!this.noRotate) {
      this.rotateObject();
    }
    if (!this.noZoom) {
      this.zoomObject();
    }
    if (!this.noPan) {
      this.panObject();
    }
    return this.object.matrixWorldNeedsUpdate = true;
  }, this);
  keydown = __bind(function(event) {
    if (!this.enabled) {
      return;
    }
    if (_state !== STATE.NONE) {
      return;
    } else if (event.keyCode === this.keys[STATE.ROTATE] && !this.noRotate) {
      _state = STATE.ROTATE;
    } else if (event.keyCode === this.keys[STATE.ZOOM] && !this.noZoom) {
      _state = STATE.ZOOM;
    } else if (event.keyCode === this.keys[STATE.PAN] && !this.noPan) {
      _state = STATE.PAN;
    }
    if (_state !== STATE.NONE) {
      return _keyPressed = true;
    }
  }, this);
  keyup = __bind(function(event) {
    if (!this.enabled) {
      return;
    }
    if (_state !== STATE.NONE) {
      return _state = STATE.NONE;
    }
  }, this);
  mousedown = __bind(function(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (_state === STATE.NONE) {
      _state = event.button;
      if (_state === STATE.ROTATE && !this.noRotate) {
        return _rotateStart = _rotateEnd = this.getMouseProjectionOnBall(event.clientX, event.clientY);
      } else if (_state === STATE.ZOOM && !this.noZoom) {
        return _zoomStart = _zoomEnd = this.getMouseOnScreen(event.clientX, event.clientY);
      } else if (!this.noPan) {
        return _panStart = _panEnd = this.getMouseOnScreen(event.clientX, event.clientY);
      }
    }
  }, this);
  mousemove = __bind(function(event) {
    if (!this.enabled) {
      return;
    }
    if (_keyPressed) {
      _rotateStart = _rotateEnd = this.getMouseProjectionOnBall(event.clientX, event.clientY);
      _zoomStart = _zoomEnd = this.getMouseOnScreen(event.clientX, event.clientY);
      _panStart = _panEnd = this.getMouseOnScreen(event.clientX, event.clientY);
      _keyPressed = false;
    }
    if (_state === STATE.NONE) {} else if (_state === STATE.ROTATE && !this.noRotate) {
      return _rotateEnd = this.getMouseProjectionOnBall(event.clientX, event.clientY);
    } else if (_state === STATE.ZOOM && !this.noZoom) {
      return _zoomEnd = this.getMouseOnScreen(event.clientX, event.clientY);
    } else if (_state === STATE.PAN && !this.noPan) {
      return _panEnd = this.getMouseOnScreen(event.clientX, event.clientY);
    }
  }, this);
  mouseup = __bind(function(event) {
    if (!this.enabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    return _state = STATE.NONE;
  }, this);
  this.domElement.addEventListener('contextmenu', (function(event) {
    return event.preventDefault();
  }), false);
  this.domElement.addEventListener('mousemove', mousemove, false);
  this.domElement.addEventListener('mousedown', mousedown, false);
  this.domElement.addEventListener('mouseup', mouseup, false);
  window.addEventListener('keydown', keydown, false);
  return window.addEventListener('keyup', keyup, false);
};