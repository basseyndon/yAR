/*
yAR implemented by Ray Chen
http://pojuichen.com
*/

var ar = new yAR( function( parseData ) {
    
	//This section will be used in getting real-time data from database to render within geo fence
	var xhr = new XMLHttpRequest();
    xhr.open("GET", "js/data.json", true);
    xhr.onload = function() { 
		try {
			var data = JSON.parse(xhr.responseText);
			parseData(data);
		} catch (e) {
			console.log(e);
		}	
    };
    xhr.send();
});

ar.setViewer(document.getElementById('camera'));