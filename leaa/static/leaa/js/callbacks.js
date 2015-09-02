// create axis geometry properties
function addAxes(pos) {
	var axes = new THREE.AxisHelper(20);
	axes.position = pos;
	return axes;
};

// create marker geometry properties
function addMarker(pos) {
	var markerGeometry = new THREE.BoxGeometry(1,1,1);
	var markerMaterial = new THREE.MeshBasicMaterial( {color: 0xcccccc} );
	var marker = new THREE.Mesh(markerGeometry, markerMaterial);
	marker.position = pos;
	return marker;
};

// takes an array of scene objects and adds them to the scene
function addToScene(array) {
	for (k in array) {
		if (array[k] != null) {
			console.log("adding " + array[k]);
			//console.log(array);
			scene.add(array[k]);
		}
	}
};

// ANIMATION
function animateVectors() {
	stepVectors();
};

//Calculation of wind directions
// u --> positive from W --> E
// v --> positive from N --> S
// speed --> magnitude of vector
// direction --> wind direction of wind rose in degrees
function calcDirection(spd, dir) {
	//convert from degrees to radians
	var dirRadians = (dir/360.0)*2*Math.PI;
	var u = 0;
	var v = 0;
	
	if (dirRadians > 0 && dirRadians <= Math.PI * 0.5) {
		u = Math.sin(dirRadians);
		v = -Math.cos(dirRadians);
		//settings.vectorColor = 0xcc0000;
	}
	else if (dirRadians > Math.PI * 0.5 && dirRadians <= Math.PI) {
		u = -Math.sin(2*Math.PI - dirRadians);
		v = -Math.cos(2*Math.PI - dirRadians);
		//settings.vectorColor = 0x00cc00;
	}
	else if (dirRadians > Math.PI && dirRadians <= Math.PI * 1.5) {
		u = -Math.sin(dirRadians - Math.PI);
		v = Math.cos(dirRadians - Math.PI);
		//settings.vectorColor = 0x0000cc;
	}
	else if (dirRadians > Math.PI * 1.5 || dirRadians == 0) {
		u = Math.sin(Math.PI - dirRadians);
		v = Math.cos(Math.PI - dirRadians);
		//settings.vectorColor = 0x00cccc;
	}
	//console.log("u = " + u + " v = " + v);
	return new THREE.Vector3(u, v, 0);
};

// converts UTM coordinates to DEM coordinates
function calcStationPos(nx, ny)
{
	var coords = new Object();
	coords.x = Math.floor((nx - MIN_UTMx)/STEP_SIZE);
	coords.y = Math.floor((MAX_UTMy - ny)/STEP_SIZE);
	return coords;
};

// remove arrows from the last time step
function clearArrows() {
	for(var j in stations.array) {
		removeFromScene(stations.array[j].sceneObjs.arrows);
		for (var i in stations.array) {
			delete stations.array[j].sceneObjs.arrows[i];
		}
	}
};

// add a new station to the scene
function createNewStations() {
	var newStation = new Object();
	
	var sName = prompt("Enter Station Name", "Test");
	var sEast = promptEasting("563800");
	var sNorth = promptNorthing("4897002");
	var sFile = prompt("Where will the files be located?", "resources/test/");
	
	newStation.name = sName;
	newStation.utmX = sEast;
	newStation.utmY = sNorth;
	
	var demCoords = calcStationPos(newStation.utmX, newStation.utmY);
	newStation.demx = demCoords.x;
	newStation.demy = demCoords.y;
	newStation.sceneObjs = {};
	newStation.sceneObjs.arrows = {};
	newStation.data = {};
	newStation.fileLocation = sFile;
	
	stations.array.push(newStation);
	reloadStations();
};

// add loaded stations to the scene
function createStations() {
	for (var k in stations.array) {
		stations.array[k].pos = terrainMap[(stations.array[k].demy * DEMx) + stations.array[k].demx];
		console.log("Position Added");
		//stations.array[k].sceneObjs.marker = addMarker(stations.array[k].pos);
		scene.add(addMarker(stations.array[k].pos));
		console.log("Marker Added");
		//stations.array[k].sceneObjs.axes = addAxes(stations.array[k].pos);
		scene.add(addAxes(stations.array[k].pos));
		console.log("Axes Added");
		//addToScene(stations.array[k].sceneObjs);
		output("Loaded station: " + stations.array[k].name);
	}
};

// adds vectors to the scene
function displaySet(k) {
	for (var j in stations.array) {
		var spdArray = stations.array[j].data.speeds[k];
		var dirArray = stations.array[j].data.directions[k];
		for (var i in spdArray) {
			stations.array[j].sceneObjs.arrows[i] = (makeArrow(i, stations.array[j].pos, spdArray[i], dirArray[i]));
		}
		addToScene(stations.array[j].sceneObjs.arrows);
	}
	var date = formatTimestamp(stations.array[0].data.dates[k]);
	output(date);
};

// allows user to edit station properties
function editStation(num) {
	var nName = prompt("New Station Name", stations.array[num].name);
	var nEast = promptEasting(stations.array[num].utmX);
	var nNorth = promptNorthing(stations.array[num].utmY);
	var nFile = prompt("New File Location", stations.array[num].fileLocation);
	
	var nCoords = calcStationPos(nEast, nNorth);
	
	stations.array[num].name = nName;
	stations.array[num].utmX = nEast;
	stations.array[num].utmY = nNorth;
	stations.array[num].demx = nCoords.x;
	stations.array[num].demy = nCoords.y;
	stations.array[num].fileLocation = nFile;
	
	reloadStations();
};

// format and print time stamps
function formatTimestamp(datestring) {
	var year = datestring.substring(0,2);
	var month = datestring.substring(2, 4);
	var day = datestring.substring(4, 6);
	var hour = datestring.substring(6, 8);
	var minute = datestring.substring(8, 10);
	
	return "Timestamp: " + month + "/" + day + "/" + year + " at " + hour + ":" + minute;
};

//refreshes the data
function keepUp(nData) {
	//stations = nData;
	for (var k in stations.array) {
		stations.array[k].data = nData.array[k].data;
	}
	console.log(stations);
};

// lists stations in the UI
function listStations() {
	var list = "";
	for(var k in stations.array) {
		list += "<strong>" + stations.array[k].name + "</strong><br/>UTM East: " + stations.array[k].utmX + " UTM North: " + stations.array[k].utmY + "<br/>";
		list += "<button type=\"button\" onclick=\"editStation(" + k.toString() + ")\">Edit</button><br/><br/>";
		//console.log(list);
	}
	$("#station-list").html(list);
};

// wrapper function for loading in stations
function loadData()
{
	loadStations('resources/stations.json?timestamp'+new Date().getTime());
};

//load in settings from server
function loadSettings(callback) {
    ($.ajax({
	  url: 'resources/settings.json?timestamp='+new Date().getTime(),
	  dataType: "json",
	  success: function (data) {
		settings = data;
		callback.call();
	  }
       }));
};

// loads in station data from JSON file
function loadStations(fileLoc)
{
   ($.ajax({
      url: fileLoc,
      dataType: "json",
      success: function (data) {
            stations = data;
	    createStations();
	    listStations();
      }
   }));
};

// calculate arrow properties and push the JSON
function makeArrow(ck, originPos, cSpd, cDir) {
	var origin = new THREE.Vector3(originPos.x, originPos.y, originPos.z + (ck*settings.heightScale*.2));
	var curSpeed = parseFloat(cSpd);
	var vCol = parseInt(settings.vectorColor);
	if(isNaN(curSpeed) || curSpeed == 0){
		return null;
	}
	else {
		var dir = calcDirection(curSpeed, parseInt(cDir));
		var target = origin.clone().add(dir);
		var qDir = new THREE.Vector3().subVectors(target, origin);
		var arrow = new THREE.ArrowHelper(qDir.normalize(), origin, curSpeed * settings.vectorScale, vCol);
		return arrow;
		//scene.add(arrow);
	}
};

// prompt the user for EASTING when updating stations
function promptEasting(defVal) {
	var easting = prompt("Enter UTM Easting", defVal);
	if (isNaN(parseFloat(easting)) || easting > MAX_UTMx || easting < MIN_UTMx) {
		while (isNaN(parseFloat(easting)) || easting > MAX_UTMx || easting < MIN_UTMx) {
			alert("Oops, that value isn't valid!");
			easting = prompt("Enter UTM East");
		}
	}
	return easting;
};

// prompt the user for NORTHING when updating stations
function promptNorthing(defVal) {
	var northing = prompt("Enter UTM Northing", defVal);
	if (isNaN(parseFloat(northing)) || northing > MAX_UTMy || northing < MIN_UTMy) {
		while (isNaN(parseFloat(northing))) {
			alert("Oops, that value isn't valid!");
			northing = prompt("Enter UTM North");
		}
	}
	return northing;
};

//update stations, save them to the server
function reloadStations() {
	output("Reloading Stations");
	clearArrows();
	createStations();
	listStations();
	
	var temp = $.map(stations.array, function(station) {
		console.log(station);
		return {data:{},
			demx:station.demx,
			demy:station.demy,
			fileLocation:station.fileLocation,
			lat:station.lat,
			lon:station.lon,
			name:station.name,
			sceneObjs:{},
			utmX:station.utmX,
			utmY:station.utmY
			};
			
	});
	
	console.log(temp);

	var ns = JSON.stringify({array:temp});
	console.log(ns);
	writeStations(ns);
};

// takes an array of scene objects, and removes them
function removeFromScene(array) {
	for (k in array) {
		if (array[k] != null) {
			scene.remove(array[k]);
			delete array[k];
		}
	}
};

// RESET
function resetScene() {
	
	clearArrows();
	step = -1;
	stopAnimation();
	resetVis();
	
// Reset toggles
	showContours = false;
	showAxes = true;

// Reset camera
	camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
	//camera.translateY( - 10);
	orbitcontrols.reset();
	//flycontrols.reset();
	/*
	if (!flyThroughEnabled)
	{
		controls.reset();
		console.log("Orbit Controls Reset");
	}
	*/
// Reset terrain
	terrainMaterial.map = THREE.ImageUtils.loadTexture('resources/reliefHJAndrews.png')
	terrain.material = terrainMaterial;

// Reset Animation button

// Reset current-timestamp-label
	$("#current-timestamp-label").html("Scene Reset");
	
	
};

// Start over from time step 1
function resetVis() {
	stopAnimation();
	if (step>0) {
		clearArrows();
	}
	step = 0;
	if (typeof nuData !== 'undefined')
	{
		keepUp(nuData);
		displaySet(0);
		step = step + 1;
	}
	else {
	}
};

// CAMERA VIEWS
// Top view
function topView() {
	camera.position.set(0,0,80);
	//controls.reset();
};

// Valley View ** placeholder until I can implement a "snap" feature
function valleyView() {
	camera.position.set(-130,-80,60);
};


// toggles Animation 
function startAnimation() {
	if(animating) {
		stopAnimation();
	}
	else {
		stepVectors();
		animating = true;
		intervalID = setInterval(animateVectors, 1000/4);
	}
};

// Progress visualization by one step
function stepVectors() {
	if (typeof nuData !== 'undefined')
	{
		if (step == -1) {
			step = 0;
			keepUp(nuData);
			displaySet(0);
			step = step + 1;
		}
		else if (step == 0) {
			keepUp(nuData);
			displaySet(0);
			step = step + 1;
		}
		else if (step >= 0 && step < 288) {
			updateData(step);
			step = step + 1;
		}
		else {
			alert("Sorry, there isn't any more data in this file!");
			stopAnimation();
		}
		}
	else {
		alert("Oops you forgot to load in a file!");
		stopAnimation();
	}
};

//toggle Animation
function stopAnimation()
{
	animating = false;
	//$("#animateButton").html("Animate");
	clearInterval(intervalID);
};

// TOGGLE CONTOURS
function toggleContours(){
	if (showContours){
	// turn contours off
		terrainMaterial.map = THREE.ImageUtils.loadTexture('resources/reliefHJAndrews.png');
		terrain.material = terrainMaterial;
		showContours=false;
	}
	else{
	// turn contours on
		terrainMaterial.map = THREE.ImageUtils.loadTexture('resources/contour_relief.png');
		terrain.material = terrainMaterial;
		showContours=true;
	}
};

// update color of vectors 
function updateColor(nHex) {
	$('#colorPicker').val();
	var ns = nHex;
	ns = "0x" + ns.substring(1, ns.length);
	settings.vectorColor = ns;
	if (step > -1) {
		updateData(step);
	}
	
	var ns = JSON.stringify(settings);
	writeSettings(ns);
};

// updates vis
function updateData(k) {
	clearArrows();
	displaySet(k);
};

// update vertical distance between vectors
function updateHeightScale(nScale) {
	settings.heightScale = parseFloat(nScale);
	if (step > -1) {
		updateData(step);
	}
	
	var ns = JSON.stringify(settings);
	writeSettings(ns);
};

// update length of vectors
function updateSpeedScale(nScale) {
	settings.vectorScale = parseFloat(nScale);
	if (step > -1) {
		updateData(step);
	}
	
	var ns = JSON.stringify(settings);
	writeSettings(ns);
	
};

// update height of terrain map
function updateDemScale(nScale) {
	old_scale = settings.demScale;
	settings.demScale = parseFloat(nScale);
	/*
	if (step > -1) {
		updateData(step);
	}
	*/
	
	var ns = JSON.stringify(settings);
	writeSettings(ns);
	
	// remove the current DEM from the scene (we need to recalculate the vertices)
	scene.remove(terrain);
	console.log("Removed terrain");
	for (var i = 0, l = terrainGeometry.vertices.length; i < l; i++) {
		terrainGeometry.vertices[i].z = terrainGeometry.vertices[i].z*settings.demScale/old_scale;
	};
	terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
	scene.add(terrain);
	console.log("Readded terrain");
	//render();
};

//callback to load settings into the UI after JSON data has loaded
function updateSettings() {
	console.log(settings);
	document.getElementById("scaleDem").value = settings.demScale;
	document.getElementById("scaleLength").value = settings.vectorScale;
	document.getElementById("scaleHeight").value = settings.heightScale;
	var htmlcolor = "#" + settings.vectorColor.substring(2, settings.vectorColor.length);
	
	document.getElementById("colorPicker").value = htmlcolor;
};

//save settings to the server
function writeSettings(ns) {
	$.post('php/saveSettings.php', {json: ns}, function() {console.log(ns);});
}

//save stations to the server
function writeStations(ns) {
	$.post('php/saveStations.php', {json: ns}, function() {console.log(ns);});
}



