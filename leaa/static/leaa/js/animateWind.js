/**
 * Created by Taylor on 9/10/2015.
 */
steal(function () {


	$('#stepForward').on('click', function() {
        clearArrows();
        //console.log(dispIndexArray);
		if (isMaxed) {setMaxBack()}
		var stationsToRender = compareDates(); //TODO: revert this change
        //var stationsToRender = [0,1];
        //console.log(stationsToRender);
		$.each(stationsToRender, function(id, stationIndex) {
            var stationName = stationNames[stationIndex];
            var renderIndex = dispIndexArray[stationIndex];
            //console.log('Rendering arrows for ' + stationName);
            var data = stationData[stationName];

            var recordDate = data.dates[renderIndex];
            //TODO: Update SODAR Log with date of the record
            var speedArray = data.speeds[renderIndex];
            var dirArray = data.directions[renderIndex];
            var heightArray = data.heights;
            var stationPos = stationPositions[stationIndex];

            var arrowSet = makeArrowSet(speedArray, dirArray, heightArray, stationPos);
            $.each(arrowSet, function(handle, arrow) {
                if (arrow !== null) {
                    arrow.name = "windvector";
                    scene.add(arrow);
                }
            });
            //console.log(dispIndexArray[stationIndex]);
            dispIndexArray[stationIndex] = dispIndexArray[stationIndex] + 1;
            //console.log(dispIndexArray[stationIndex]);
		});
        console.log(dispIndexArray);
	});

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

	/*
	Returns a list of station indices to determine whether we render that station on this date
	 */
	function compareDates() {
		var datesToCompare = [];
		var stationsToUpdate = [];
        var allStationIDs = [];
		// Get the dates to check against
		$.each(dispIndexArray, function(id, index) {
            allStationIDs.push(id);
			var stationName = stationNames[id];
			datesToCompare.push(stationData[stationName].dates[index]);
		});
		if (Math.max.apply(Math, datesToCompare) == Math.min.apply(Math, datesToCompare)) {
            //console.log('All dates match');
			stationsToUpdate = allStationIDs;
			return stationsToUpdate;
		} else {
            //console.log('Date mismatch');
			var minimum = Math.max.apply(Math, datesToCompare);
			$.each(datesToCompare, function(id, date) {
				if (date == minimum) {
					stationsToUpdate.push(id)
				}
			});
            return stationsToUpdate;
		}

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

	function isMaxed() {
		$.each(dispIndexArray, function(index, value) {
			if (value == dispIndexMax) {
				return true;
			}
		});
		return false;
	}

	function allSentinal() {
        var flag = true;
		$.each(dispIndexArray, function(index, value) {
			if (value !== -1) {
                console.log('Not sentinal values');
				flag = true;
			}
		});
		return flag;
	}

	function setMaxBack() {
		$.each(dispIndexArray, function(index, value) {
			if (value >= dispIndexMax) {
				dispIndexArray[index] = dispIndexArray-1;
			}
		});
	}

	function setToZero() {
		$.each(dispIndexArray, function(index, value) {
			dispIndexArray[index] = 0;
		})
	}

	/*
	Generates a moment of arrows for a single render.
	 */
	function makeArrowSet(spdArray, dirArray, heightArray, stationPos) {
		var arrowSet = [];
		for (var i in spdArray) {
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

    function clearArrows() {
        /*
        $.each(arrowObjects, function(id, arrow) {
            scene.remove(arrow);
            var deleteArrow = arrowObjects.pop();
            delete deleteArrow;
        })
        */
        /*
        $.each(scene.children, function(id, threeObject) {
            if (threeObject.name == 'windvector') {
                scene.remove(threeObject);
            }
        });*/
        var obj, i;
        for (i = scene.children.length -1; i >= 0; i--) {
            obj = scene.children[i];
            if (obj.name == 'windvector') {
                scene.remove(obj);
                console.log('removed windvector');
            }
        }
    }

    /*
    TODO: OLD STUFF, delete it eventually
     */

	// updates vis
	function updateData(k) {
		clearArrows();
		displaySet(k);
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
		//showContours = false;
		//showAxes = true;

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
		texture.map = THREE.ImageUtils.loadTexture('resources/reliefHJAndrews.png');
		terrainGeo.material = texture.map;

// Reset Animation button

// Reset current-timestamp-label
	$("#current-timestamp-label").html("Scene Reset");


	}
});