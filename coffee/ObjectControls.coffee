###
Controller that moves the object instead of the camera

Modified from the TrackBallControls in Three.js

Author: Ruijin Wu <cszwrj at gmail.com>
###


THREE.ObjectControls = ( object, camera, domElement ) ->
    STATE = { NONE : -1, ROTATE : 0, ZOOM : 1, PAN : 2 }

    @object = object
    object.useQuaternion = true

    @camera = camera
    @domElement = domElement ? document

    # API
    @enabled = true

    @screen = { width: window.innerWidth, height: window.innerHeight, offsetLeft: 0, offsetTop: 0 }
    @radius = ( @screen.width + @screen.height ) / 4

    @rotateSpeed = 1.0
    @zoomSpeed = 1.2
    @panSpeed = 0.3

    @noRotate = false
    @noZoom = false
    @noPan = false

    @staticMoving = false
    @dynamicDampingFactor = 0.2

    @minDistance = 0
    @maxDistance = Infinity

    @keys = [ 65, 83, 68 ] # A, S, D

    # internals
    @target = new THREE.Vector3( 0, 0, 0 )

    _keyPressed = false
    _state = STATE.NONE

    _eye = new THREE.Vector3()

    _rotateStart = new THREE.Vector3()
    _rotateEnd = new THREE.Vector3()

    _zoomStart = new THREE.Vector2()
    _zoomEnd = new THREE.Vector2()

    _panStart = new THREE.Vector2()
    _panEnd = new THREE.Vector2()


    # methods
    @handleEvent = ( event ) =>

       if ( typeof this[ event.type ] == 'function' )
           this[ event.type ]( event )


    @getMouseOnScreen = ( clientX, clientY ) =>
        return new THREE.Vector2(
            ( clientX - @screen.offsetLeft ) / @radius * 0.5,
            ( clientY - @screen.offsetTop ) / @radius * 0.5
        )

    @getMouseProjectionOnBall = ( clientX, clientY ) =>

        mouseOnBall = new THREE.Vector3(
            ( clientX - @screen.width * 0.5 - @screen.offsetLeft ) / @radius,
            ( @screen.height * 0.5 + @screen.offsetTop - clientY ) / @radius,
            0.0
        )

        length = mouseOnBall.length()

        if ( length > 1.0 )
            mouseOnBall.normalize()
        else
            mouseOnBall.z = Math.sqrt( 1.0 - length * length )

        _eye.copy( @camera.position ).subSelf( @target )

        projection = @camera.up.clone().setLength( mouseOnBall.y )
        projection.addSelf( @camera.up.clone().crossSelf( _eye ).setLength( mouseOnBall.x ) )
        projection.addSelf( _eye.setLength( mouseOnBall.z ) )

        return projection


    @rotateObject = () =>
        angle = Math.acos( _rotateStart.dot( _rotateEnd ) / _rotateStart.length() / _rotateEnd.length() )

        if (angle)
            axis = ( new THREE.Vector3() ).cross( _rotateStart, _rotateEnd ).normalize()
            quaternion = new THREE.Quaternion()

            angle *= @rotateSpeed

            tQuaternion = new THREE.Quaternion()
            tQuaternion.setFromAxisAngle( axis, angle )

            #tQuaternion.normalize()
            @object.quaternion.multiply(tQuaternion,@object.quaternion)
            @object.quaternion.normalize()

            quaternion.setFromAxisAngle( axis, -angle )
            quaternion.multiplyVector3( _rotateEnd )

            if ( @staticMoving )
                _rotateStart = _rotateEnd
            else
                quaternion.setFromAxisAngle( axis, angle * ( @dynamicDampingFactor - 1.0 ) )
                quaternion.multiplyVector3( _rotateStart )


    @zoomObject = () =>
        factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * @zoomSpeed

        if ( factor != 1.0 && factor > 0.0 )
            @object.scale.divideScalar(factor)

            if ( @staticMoving )
                _zoomStart = _zoomEnd
            else
                _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * @dynamicDampingFactor


    @panObject = () =>
        mouseChange = _panEnd.clone().subSelf( _panStart )

        if ( mouseChange.lengthSq() )
            mouseChange.multiplyScalar( _eye.length() * @panSpeed )

            pan = _eye.clone().crossSelf( @object.up ).setLength( mouseChange.x )
            pan.addSelf( @object.up.clone().setLength( mouseChange.y ) )

            @object.position.subSelf( pan )

            if ( @staticMoving )
                _panStart = _panEnd
            else
                _panStart.addSelf( mouseChange.sub( _panEnd, _panStart ).multiplyScalar( @dynamicDampingFactor ) )


    @update = () =>
        if ( !@noRotate )
            @rotateObject()

        if ( !@noZoom )
            @zoomObject()

        if ( !@noPan )
            @panObject()

        @object.matrixWorldNeedsUpdate = true


    # listeners
    keydown = ( event ) =>
        if ( ! @enabled )
            return

        if ( _state != STATE.NONE )
            return
        else if ( event.keyCode == @keys[ STATE.ROTATE ] && !@noRotate )
            _state = STATE.ROTATE
        else if ( event.keyCode == @keys[ STATE.ZOOM ] && !@noZoom )
            _state = STATE.ZOOM
        else if ( event.keyCode == @keys[ STATE.PAN ] && !@noPan )
            _state = STATE.PAN

        if ( _state != STATE.NONE )
            _keyPressed = true


    keyup = ( event ) =>
        if ( ! @enabled )
            return

        if ( _state != STATE.NONE )
            _state = STATE.NONE


    mousedown = ( event ) =>
        if ( ! @enabled )
            return

        event.preventDefault()
        event.stopPropagation()

        if ( _state == STATE.NONE )
            _state = event.button

            if ( _state == STATE.ROTATE && !@noRotate )
                _rotateStart = _rotateEnd = @getMouseProjectionOnBall( event.clientX, event.clientY )
            else if ( _state == STATE.ZOOM && !@noZoom )
                _zoomStart = _zoomEnd = @getMouseOnScreen( event.clientX, event.clientY )
            else if ( !@noPan )
                _panStart = _panEnd = @getMouseOnScreen( event.clientX, event.clientY )


    mousemove = ( event ) =>

        if ( ! @enabled )
            return

        if ( _keyPressed )
            _rotateStart = _rotateEnd = @getMouseProjectionOnBall( event.clientX, event.clientY )
            _zoomStart = _zoomEnd = @getMouseOnScreen( event.clientX, event.clientY )
            _panStart = _panEnd = @getMouseOnScreen( event.clientX, event.clientY )
            _keyPressed = false

        if ( _state == STATE.NONE )
            return
        else if ( _state == STATE.ROTATE && !@noRotate )
            _rotateEnd = @getMouseProjectionOnBall( event.clientX, event.clientY )
        else if ( _state == STATE.ZOOM && !@noZoom )
            _zoomEnd = @getMouseOnScreen( event.clientX, event.clientY )
        else if ( _state == STATE.PAN && !@noPan )
            _panEnd = @getMouseOnScreen( event.clientX, event.clientY )


    mouseup = ( event ) =>
        if ( ! @enabled )
            return

        event.preventDefault()
        event.stopPropagation()

        _state = STATE.NONE

    @domElement.addEventListener( 'contextmenu', ((event) -> event.preventDefault()), false )

    @domElement.addEventListener( 'mousemove', mousemove, false )
    @domElement.addEventListener( 'mousedown', mousedown, false )
    @domElement.addEventListener( 'mouseup', mouseup, false )

    window.addEventListener( 'keydown', keydown, false )
    window.addEventListener( 'keyup', keyup, false )

