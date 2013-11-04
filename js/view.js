/*
Viewing Mode for yAR
*/

var creeper;

function initViewing(){
	
	ar.Mode = MODE_VIEW;
	//addGeoObject("33.776035","-84.388701");	//32,-87
	//addGeoObject(ar.currentLocation.latitude+0.01,ar.currentLocation.longitude);
	//addModel( 'model/Room.dae', 0, 0, 0, 100 );
	addMinecraftChar();
}

function addGeoObject(lati, longti){
	var target = {"latitude":lati,"longitude":longti};
	var d = distance( ar.currentLocation, target );
	var theta = Math.atan2(lati-ar.currentLocation.latitude,longti-ar.currentLocation.longitude);		//from -PI to PI
	var fixedAlpha = (ar.currentOrientation.alpha>180) ? (ar.currentOrientation.alpha-360) : ar.currentOrientation.alpha;
	var angleDiff = (theta - fixedAlpha)*Math.PI/180;
	//var SceneCoord = {'x':d*Math.cos(angleDiff),'y':0,'z':-d*Math.sin(angleDiff)};
	var SceneCoord = {'x':d*Math.cos(theta),'y':0,'z':-d*Math.sin(theta)};
	console.log(SceneCoord.x+","+SceneCoord.z);

	var testgeoobj = new THREE.Mesh(new THREE.SphereGeometry(300,8,8), new THREE.MeshLambertMaterial({color: 0x77ffff, wireframe: true}));
	testgeoobj.position.set( SceneCoord.x, SceneCoord.y, SceneCoord.z );
	ar.scene.add(testgeoobj);
}

function addModel( path, x, y, z, scale ){
	
	var dae;
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load( path, function ( collada ) {

		dae = collada.scene;
		dae.position.set( x, y, z );
		dae.scale.set( scale, scale, scale );	
		dae.position.y = -200;
		dae.updateMatrix();					

		ar.scene.add( dae );
	});
}

function addMinecraftChar(){
	creeper = new Character();
	creeper.model.position.set(0,0,-20);
	creeper.model.scale.setLength(1/2);
	ar.scene.add(creeper.model);
	
}

function distance(pos1, pos2) {
	function toRad(n) {
		return n * Math.PI / 180;
	}
	var R = 6371000; // m
	var dLat = toRad(pos2.latitude-pos1.latitude);
	var dLon = toRad(pos2.longitude - pos1.longitude);
	var lat1 = toRad(pos1.latitude);
	var lat2 = toRad(pos2.latitude);
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 	//c is the angular distance in radians
	var d = R * c;

	return d;
}