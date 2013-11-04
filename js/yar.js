/*
yAR is a Browser-based Mobile Augmented Reality Web Page
*/

var MODE_VIEW = 0, MODE_BUILD = 1;		//yAR generates View and Build Mode

var yAR = function(getPOI, options) {
    
	var self = this;	
	this.Mode = MODE_VIEW;		//ViewMode = 0, BuildMode = 1;

    this.currentLocation;		//Current Lat/Long
	this.currentOrientation;	//Current Alpha, Beta, Gamma
	
    this.CamLayer;				//Camera Layer
	this.ARLayer;				//AR Layer
	
	//set camera view
    this.setViewer = function (element) {
		this.CamLayer = element;
    }

	//camera stream play
    this.addStream = function (stream) {
		var source;
		if (window.webkitURL) {
			source = window.webkitURL.createObjectURL(stream);
			self.CamLayer.autoplay = true;
		} else {
			source = stream; 
		}
		if (self.CamLayer.mozSrcObject !== undefined) {
			self.CamLayer.mozSrcObject = source;
		} else {
			self.CamLayer.src = source;
		}
		self.CamLayer.play();     
    };
    
	//set device's location
    this.setPosition = function( pos ){
		
		//Manually update current location from Geolocation API
		/*setInterval( function(){
			navigator.geolocation.getCurrentPosition( 
				self.updatePosition, 
				//function(e){alert("Update Location Error: "+e.message);},
				function(e){console.log(e);},
				{ enableHighAccuracy: true, timeout: 500 } 
			);
		}, 500 );	*/
		
		//Set Initial Device's location
		self.currentLocation = {"latitude":pos.coords.latitude,"longitude":pos.coords.longitude};
		
		//Notify location received
		self.onDeviceSensorRecevied();
	
		/*getPOI( function (data) {
			for (var i = 0 ; i < data.length; i++) {
			var p = projectedPOI(here,data[i]);
			maxDistance = Math.max(maxDistance, p.distance);
			self.poi.push(p);
			}
		});*/
    };
	
	this.updatePosition = function( pos ){
		self.currentLocation = {"latitude":pos.coords.latitude,"longitude":pos.coords.longitude};
		document.getElementById('geo').innerHTML = 'Geo:'+pos.coords.latitude+","+pos.coords.longitude;
	};	
	
	this.onDeviceSensorRecevied = function(){
		if( self.currentLocation != undefined && 
		self.currentOrientation != undefined ){	//if both location and orientation received

			//Start 3D Scene
			self.init3DScene();			
		}
	};
	
	/**************************************************AR Object*****************************************************/ 
	this.setGeoObject = function(lati, longti){
		//TO-DO
		//var target = {"latitude":lati,"longitude":longti};
		//var d = distance( self.currentLocation, target );		
	}
	
	/**************************************************3D SCENE*****************************************************/ 
	var camera, cameraObject, scene, renderer;
	var cubes;
	var stats;	//Performance Tracker
	
	var buildCamera, buildCameraObject, buildScene;
	
	this.init3DScene = function(){
		
		//View Mode
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );	
		cameraObject = new THREE.Object3D();
		cameraObject.add( camera );	
		
		scene = new THREE.Scene();
		scene.add( cameraObject );
		var pointlight = new THREE.PointLight(0xffffff, 1);
		scene.add( pointlight );
			
		//Build Mode
		buildCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );	
		buildCamera.position.set(500,0,500);
		buildCameraObject = new THREE.Object3D();
		buildCameraObject.add( buildCamera );
		
		buildScene = new THREE.Scene();
		buildScene.add( buildCameraObject );
		var bpointlight = new THREE.PointLight(0xffffff, 1);
		bpointlight.position = buildCamera.position;
		buildCameraObject.add( bpointlight );
		
		//Test Rotating Cubes
		cubes = new THREE.Object3D();
		for(var i=0;i<10;i++){
		var cube = new THREE.Mesh(new THREE.CubeGeometry(100,100,100), new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture('img/crate.gif'), wireframe: false}));
		cube.position.set(500*Math.cos(36*i/(360)*2*Math.PI),0,500*Math.sin(36*i/(360)*2*Math.PI));		
		cubes.add( cube );
		}
		scene.add( cubes );

		renderer = new THREE.WebGLRenderer({ antialias: false});
        renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.left = 0;
		renderer.domElement.style.top = 0;
		
		self.CamLayer.parentElement.appendChild( renderer.domElement );	
		
		//Performance
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.right = '0px';
		self.CamLayer.parentElement.appendChild( stats.domElement );
		
		//global usage to be fixed
		self.scene = scene;
		self.camera = camera;
		self.ARLayer = renderer.domElement;
		self.buildScene = buildScene;
		self.buildCamera = buildCamera;
		self.buildCameraObject = buildCameraObject;
		
		// initialize AR building process
		initBuilding();
		
		// initialize AR viewing
		initViewing();
		
		// events
		window.addEventListener( 'resize', onWindowResize, false );	
		
		// Switch View and Build Mode
		Hammer( document.getElementById('switchModeButton') ).on("tap", onSwitchMode);
		
		// animate loop
		animate();
	}
	
	function onSwitchMode(){
	
		//Hide Current UI
		hideUI();
	
		if( self.Mode == MODE_VIEW ){
			self.Mode = MODE_BUILD;
			this.textContent = 'Build';
			
			//Initiate UI for Building Mode
			initBuildUI();
		}
		else if( self.Mode == MODE_BUILD ){
			self.Mode = MODE_VIEW;
			this.textContent = 'View';
		}
	}
	
	function hideUI(){
		document.getElementById('changeBlockMenu').style.display = "none";
	}
	
	function initBuildUI(){
		document.getElementById('changeBlockMenu').style.display = 'inline';
	}
	
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	function animate() {
 
		requestAnimationFrame( animate );
			
        render();
		stats.update();
    }
	
	function render() {
		
		for(var i=0;i<cubes.children.length;i++){
			cubes.children[i].rotation.x += 0.02;
			cubes.children[i].rotation.y += 0.04;
		}
		if( creeper ){
			creeper.model.rotation.y+= 0.01;
			creeper.update();
		}
		
		switch( self.Mode ){
		case 0:
			renderer.render( scene, camera );
			break;
		case 1:
			renderer.render( buildScene, buildCamera );
			break;
		}

	}
	
	/*********************************** Device Camera and Orientation***************************************************/
    // if options.remote is set, we don't try to capture the stream, orientation and geolocation — they'll be set externally
    if (!options || options.remote === false) {
		
		navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
	
		//GetUserMedia on Video
		if (navigator.getUserMedia) {
			navigator.getUserMedia({video:true, toString: function(){return 'video';}}, this.addStream, function(e){console.log(e);});
		}	
		
		//Get Geolocation of Device
		navigator.geolocation.getCurrentPosition( this.setPosition, function(e){console.log("Get Location Error: "+e.message);},{timeout:10000} );
		navigator.geolocation.watchPosition( this.updatePosition, function(e){console.log("Update Location Error: "+e.message);} );		

		//Update When Device Orientation Changes
		window.addEventListener("deviceorientation", function( event ) {
		//console.log(event);
			//Set current orientation from Device Orientation API
			self.currentOrientation = {'alpha':event.alpha,'beta':event.beta,'gamma':event.gamma};
		
			//Notify orientation received if 3D scene has not been set
			if( !ar.scene ){
				self.onDeviceSensorRecevied();
			}
		
			if( camera && cameraObject ){				
	
				document.getElementById('a').innerHTML = "alpha: "+event.alpha;
				document.getElementById('b').innerHTML = "beta: "+event.beta;
				
				camera.rotation.x = -Math.PI*( event.beta + 90 )/180;			// X rotation done by Camera
				cameraObject.rotation.y = -Math.PI*( event.alpha )/180;			// Y rotation done by CameraObject (parent of Camera)
			}	
		});    
    }
};

