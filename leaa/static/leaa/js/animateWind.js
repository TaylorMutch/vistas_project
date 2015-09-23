/**
 * Created by Taylor on 9/10/2015.
 */
steal(function () {

	function stepForward() {
		compareDates(); //TODO: Get the indices of the stations that we need to render on this pass
		render();

	}

	function animation() {
		//TODO: Create animation for the arrows by calling stepForward() for each interval
		// Catch the error for when we have reached the end of all dates, found with dispIndexMax
	}

	function stepBack() {
		//TODO: Design a mechanism for going back one step in the visualization. Consider the logic we already have
	}

	function resetScene() {
		//TODO:
			//Reset camera
			//reset controls
			// set dispIndexArray to sentinal -1
			// update log
	}

	function compareDates() {
		//for each index in dispIndexArray
			//get the date that we need to check against
		// if max date equals min date
			// increment all entries in dispIndexArray
			// all dates are the same
			// get the date
			// create the arrow sets for each station
		// else
			// get the minimum date
			// get the indices of the stations with the minimum date
			// increment the entries in dispIndexArray that match the minimum date
			// create the arrow sets for each of these stations
	}

	function allZero() {
		$.each(dispIndexArray, function(index, value) {
			if (value !== 0) {
				return false;
			}
		});
		return true;
	}

	/*
	Generates a moment of arrows for a single render.
	 */
	function makeArrowSet(spdArray, dirArray, heightArray, stationPos) {
		var arrowSet = [];
		for (var i in speedsArray) {
			var arrow = makeArrow(stationPos, spdArray[i], dirArray[i], heightArray[i]);
			arrowSet.push(arrow);
		}
		return arrowSet;
	}


	/*
	Generates a single arrow within an arrowSet.
	 */
    function makeArrow(stationPos, cSpeed, cDirection, cHeight) {
        var origin = new THREE.Vector3(stationPos.x, stationPos.y, stationPos.z + cHeight*.1);
        var vectorColor = 0x0000ff; //TODO: Add color to the vector
        if (isNaN(cSpeed) || cSpeed == 0) {
            return null;
        }
        else {
            var dir = calcDirection(cDirection);
            var target = origin.clone().add(dir);
            var qDir = new THREE.Vector3().subVectors(target, origin);
            return new THREE.ArrowHelper(qDir.normalize(), origin, cSpeed, vectorColor );
        }
    }


    function calcDirection(dir) {
	var dirRadians = (dir/360.0)*2*Math.PI;
	var u = 0;
	var v = 0;

	if (dirRadians > 0 && dirRadians <= Math.PI * 0.5) {
		u = Math.sin(dirRadians);
		v = -Math.cos(dirRadians);
	}
	else if (dirRadians > Math.PI * 0.5 && dirRadians <= Math.PI) {
		u = -Math.sin(2*Math.PI - dirRadians);
		v = -Math.cos(2*Math.PI - dirRadians);
    }
	else if (dirRadians > Math.PI && dirRadians <= Math.PI * 1.5) {
		u = -Math.sin(dirRadians - Math.PI);
		v = Math.cos(dirRadians - Math.PI);
	}
	else if (dirRadians > Math.PI * 1.5 || dirRadians == 0) {
		u = Math.sin(Math.PI - dirRadians);
		v = Math.cos(Math.PI - dirRadians);
	}
	//console.log("u = " + u + " v = " + v);
	return new THREE.Vector3(u, v, 0);
    }

	// updates vis
	function updateData(k) {
		clearArrows();
		displaySet(k);
	}


	// Progress visualization by one step
	function stepVectors() {
		if (typeof stationData !== 'undefined')
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
	}

	// TOGGLE CONTOURS
	function toggleContours(){
		if (showContours){
	// turn contours off
			terrain.map = THREE.ImageUtils.loadTexture('static/leaa/resources/reliefHJAndrews.png');
			terrain.material = terrainMaterial;
			showContours=false;
		}
		else{
	// turn contours on
			terrainMaterial.map = THREE.ImageUtils.loadTexture('static/leaa/resources/contour_relief.png');
			terrain.material = terrainMaterial;
			showContours=true;
		}
	}
	// RESET
	function resetScene() {

		//clearArrows();
		//step = -1;
		//stopAnimation();
		//resetVis();

		// Reset toggles
		showContours = false;
		showAxes = true;

		// Reset camera
		camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
		//camera.translateY( - 10);
		orbit.reset();
		//flycontrols.reset();
		/*
		if (!flyThroughEnabled)
		{
			controls.reset();
			console.log("Orbit Controls Reset");
		}
		*/
		// Reset terrain
		texture.map = THREE.ImageUtils.loadTexture('resources/reliefHJAndrews.png')
		terrainGeo.material = texture.map;

// Reset Animation button

// Reset current-timestamp-label
	$("#current-timestamp-label").html("Scene Reset");


	}
});