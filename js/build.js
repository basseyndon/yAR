/*
Building Mode for yAR
*/

var projector, plane;
var mouse2D, raycaster;

var voxelPosition, tmpVec;
var cubeGeo, cubeMaterial;
var coverGeo, coverMaterial;
var intersector;

//Minecraft Scene Variables
var prebuiltPlane;
var textureGrass, textureGrassDirt, textureDirt, textureCrate, textureSteel;
var isMaterialChanged = false;

function initBuilding(){

	ar.Mode = MODE_BUILD;

	voxelPosition = new THREE.Vector3();
	tmpVec = new THREE.Vector3();
	
	// cubes
	textureGrass = THREE.ImageUtils.loadTexture( 'img/minecraft/grass1.png' );
	textureGrassDirt = THREE.ImageUtils.loadTexture( 'img/minecraft/grass_dirt1.png' );					
	textureDirt = THREE.ImageUtils.loadTexture( 'img/minecraft/dirt.jpg' );
	textureCrate = THREE.ImageUtils.loadTexture( 'img/minecraft/crate.gif' );
	textureSteel = THREE.ImageUtils.loadTexture( 'img/minecraft/steel.jpg' );
	
	//textureDirt.magFilter = THREE.NearestFilter;
	//textureDirt.minFilter = THREE.LinearMipMapLinearFilter;
	
	/*var mats = [];
	mats.push( new THREE.MeshBasicMaterial( { map: textureGrassDirt , shading: THREE.FlatShading} ));
	mats.push( new THREE.MeshBasicMaterial( { map: textureGrassDirt , shading: THREE.FlatShading} ));
	mats.push( new THREE.MeshBasicMaterial( { map: textureGrass , shading: THREE.FlatShading} ));
	mats.push( new THREE.MeshBasicMaterial( { map: textureDirt , shading: THREE.FlatShading} ));
	mats.push( new THREE.MeshBasicMaterial( { map: textureGrassDirt , shading: THREE.FlatShading} ));
	mats.push( new THREE.MeshBasicMaterial( { map: textureGrassDirt , shading: THREE.FlatShading} ));*/
			
	cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
	cubeGeo.dynamic = false;
	cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: textureDirt } );
	
	coverGeo = new THREE.PlaneGeometry( 50, 50, 1, 1);
	coverMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: textureGrass } );          
	
	// projector
	projector = new THREE.Projector();
	
	// grid
	plane = new THREE.Mesh( new THREE.PlaneGeometry( 500, 500, 10, 10 ), new THREE.MeshBasicMaterial( { color: 0x555555, wireframe: true } ) );
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -800;
	ar.buildScene.add( plane );
	
	ar.buildCamera.lookAt( plane.position );
	
	/*var mergedGeo = new THREE.Geometry();
	
	for(var i=0;i<20;i++){
		for(var j=0;j<20;j++){
			var voxel = new THREE.Mesh( cubeGeo, new THREE.MeshBasicMaterial() );							
			voxel.position.set(50*(j)-500+25,-800+25,50*i-500+25);
			
			THREE.GeometryUtils.merge( mergedGeo, voxel);
		}
	}
	
	prebuiltPlane = new THREE.Mesh( mergedGeo, new THREE.MeshLambertMaterial( { color: 0xffffff, map: textureGrass } ) );
	prebuiltPlane.matrixAutoUpdate = false;
	prebuiltPlane.updateMatrix();
	ar.scene.add( prebuiltPlane );*/
	
	
	//For point on building plane
	mouse2D = new THREE.Vector3( 0, 10000, 0.5 );
	
	//Event
	Hammer( ar.ARLayer ).on("tap", onTouchTap);		//Build a block
	Hammer( ar.ARLayer ).on("hold", onTouchHold);	//Remove a block
	
	Hammer( ar.ARLayer ).on("drag", function( event ){		//Rotate Building Plane
		event.gesture.preventDefault();
		
		if( ar.buildCameraObject.position.y >= -500/2 && ar.buildCameraObject.position.y <= 500/2 ){
			
			ar.buildCameraObject.position.y += event.gesture.deltaY/10;		
			if( ar.buildCameraObject.position.y < -500/2 ) ar.buildCameraObject.position.y = -500/2;
			if( ar.buildCameraObject.position.y > 500/2 ) ar.buildCameraObject.position.y = 500/2;
			
			ar.buildCamera.position.x -= event.gesture.deltaY/10;
			ar.buildCamera.position.z -= event.gesture.deltaY/10;
			if( ar.buildCamera.position.x < 1 )
				ar.buildCamera.position.x = 1;
			if( ar.buildCamera.position.x > 500 )
				ar.buildCamera.position.x = 500;
			if(ar.buildCamera.position.z < 1 )
				ar.buildCamera.position.z = 1;
			if( ar.buildCamera.position.z > 500 )
				ar.buildCamera.position.z = 500;

		}
		ar.buildCameraObject.rotation.y += -event.gesture.deltaX/1500;
		ar.buildCamera.lookAt( plane.position );		
	});
	
	//UI Event: block texture change
	for(var i=0;i<document.querySelectorAll('#changeBlockMenu>button').length;i++){
		Hammer( document.querySelectorAll('#changeBlockMenu>button')[i] ).on( "tap", onBlockChange );
	}
	
}

function onTouchTap( event ){
	
	mouse2D.x = ( event.gesture.touches[0].pageX / window.innerWidth ) * 2 - 1;
	mouse2D.y = - ( event.gesture.touches[0].pageY / window.innerHeight ) * 2 + 1;

	raycaster = projector.pickingRay( mouse2D.clone(), ar.buildCamera );

	var intersects = raycaster.intersectObjects( ar.buildScene.children, true );

	if ( intersects.length > 0 ) {		

			setVoxelPosition( intersects[0] );

			var voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
			voxel.position.copy( voxelPosition );

			ar.buildScene.add( voxel );
	}

}

function onTouchHold( event ){

	mouse2D.x = ( event.gesture.touches[0].pageX / window.innerWidth ) * 2 - 1;
	mouse2D.y = - ( event.gesture.touches[0].pageY / window.innerHeight ) * 2 + 1;

	raycaster = projector.pickingRay( mouse2D.clone(), ar.buildCamera );

	var intersects = raycaster.intersectObjects( ar.buildScene.children, true );
	
	if ( intersects.length > 0 && intersects[0].object != plane ) {
		ar.buildScene.remove( intersects[0].object );
	}
}

function setVoxelPosition( intersector ) {

	tmpVec.copy( intersector.face.normal );
	tmpVec.applyMatrix4( intersector.object.matrixRotationWorld );
	
	voxelPosition.addVectors( intersector.point, tmpVec );

	voxelPosition.x = Math.floor( voxelPosition.x / 50 ) * 50 + 25;
	voxelPosition.y = Math.floor( voxelPosition.y / 50 ) * 50 + 25;
	voxelPosition.z = Math.floor( voxelPosition.z / 50 ) * 50 + 25;

}

function onBlockChange(){

	switch( this.id ){
	case 'block1':
		cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: textureDirt } );
		break;
	case 'block2':
		cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: textureGrass } );
		break;
	case 'block3':
		cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: textureCrate } );
		break;
	case 'block4':
		cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: textureSteel } );
		break;					
	}
}
