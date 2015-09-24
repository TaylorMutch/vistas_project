/**
 * Created by Taylor on 9/10/2015.
 */
steal(function () {


	$('#stepForward').on('click', function() {
        stepForward();
	});


    function stepForward() {
        clearArrows();
        var isDecreasing = false;
		var stationsToRender = compareDates(dispIndexArray, isDecreasing);
        if (stationsToRender.length !== 0) {
            console.log(dispIndexArray + ' is now: ');
            $.each(stationsToRender, function (id, stationIndex) {
                renderArrows(stationIndex);
                dispIndexArray[stationIndex] = dispIndexArray[stationIndex] + 1;
                updateFollowers(stationIndex, isDecreasing);
            });
            console.log(dispIndexArray);
        }
    }

	$('#stepBack').on('click', function() {
		stepBack();
	});

	function stepBack() {
		clearArrows();
        var isDecreasing = true;
        var stationsToRender = compareDates(dispIndexArray_follower, isDecreasing);
        if (stationsToRender.length !== 0) {
            dispIndexArray = dispIndexArray_follower.slice();
            $.each(stationsToRender, function(id, stationIndex) {
                //dispIndexArray[stationIndex] = dispIndexArray[stationIndex] - 1;
                updateFollowers(stationIndex, isDecreasing);
                renderArrows(stationIndex, isDecreasing);
            });
            console.log(dispIndexArray);
        }

	}

    $('#beginStep').on('click', function() {
        dispIndexArray = dispIndexArray_reset.slice();
		dispIndexArray_follower = dispIndexArray_follower_reset.slice();
        stepForward();
    });


	function updateFollowers(stationIndex, isDecreasing) { //TODO: Make this more sensical - it works, but its weird...
		if (!isDecreasing) {
			dispIndexArray_follower[stationIndex] = dispIndexArray_follower[stationIndex] + 1;
		} else {
			dispIndexArray_follower[stationIndex] = dispIndexArray_follower[stationIndex] - 1;
		}
	}

    /*
    Main Animation code
     */
    animating = false;
    isMaxed = false;

    // Enable animation
	$('#animateButton').on('click', function() {
        if (animating) {
            stopAnimation();
            $(this).html('Animate')
        }
        else {
            stepForward();
            animating = true;
            intervalID = setInterval(animateStepForward, 1000/4);
            $(this).html('Stop Animating')
        }
	});

    // Animation loop
    function animateStepForward() {
        stepForward();
    }

    // Disable animation
    function stopAnimation() {
        animating = false;
        clearInterval(intervalID);
    }


	/*
	Returns a list of station indices to determine whether we render that station on this date
	 */
	function compareDates(indexArray, isDecreasing) {
		var datesToCompare = [];
		var stationsToUpdate = [];
        var allStationIDs = [];
		// Get the dates to check against
		$.each(indexArray, function(id, index) {
            allStationIDs.push(id);
			var stationName = stationNames[id];
			datesToCompare.push(stationData[stationName].dates[index]);
		});
        // If the max date equals the max date, then all the dates must be the same
		if (Math.max.apply(Math, datesToCompare) == Math.min.apply(Math, datesToCompare)) {
            console.log('All dates match');
			stationsToUpdate = allStationIDs;
            //Otherwise, we need to get the precise stations that need updating and render them.
		} else {
            var checkDate;
            if (isDecreasing) {   //stepBack branch
                checkDate = Math.max.apply(Math, datesToCompare);
            } else {    // stepForward branch
                //console.log('Date mismatch');
                checkDate = Math.min.apply(Math, datesToCompare);
                //console.log(minimum);
            }
            $.each(datesToCompare, function (id, date) {
                if (date == checkDate) {
                        stationsToUpdate.push(id);
                        console.log('Pushed station: ' + id);
                    } else if (isNaN(date)) {
                        stationsToUpdate = [];
                        isMaxed = true;
                    }
                });

		}
        return stationsToUpdate;
	}

    function renderArrows(stationIndex) {
        var stationName = stationNames[stationIndex];
        var renderIndex = dispIndexArray[stationIndex];

        if (renderIndex >= dispIndexMax) {
            dispIndexArray[stationIndex] = dispIndexMax - 1;
        } else {
            //console.log('Rendering arrows for ' + stationName);
            var data = stationData[stationName];

            //TODO: Update SODAR Log with date of the record
            //var recordDate = data.dates[renderIndex];
            //console.log(recordDate);

            // Get the specific arrays we want
            var speedArray = data.speeds[renderIndex];
            var dirArray = data.directions[renderIndex];
            var heightArray = data.heights;
            var stationPos = stationPositions[stationIndex];

            // Render the arrows in the scene
            var arrowSet = makeArrowSet(speedArray, dirArray, heightArray, stationPos);
            $.each(arrowSet, function (handle, arrow) {
                if (arrow !== null) {
                    arrow.name = "windvector";
                    scene.add(arrow);
                }
            });
        }
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

    /*
    Calculates the direction of the wind vector based on polor coordinates
     */
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

    /*
    Remove all arrows from a scene
     */
    function clearArrows() {
        var obj, i;
        for (i = scene.children.length -1; i >= 0; i--) {
            obj = scene.children[i];
            if (obj.name == 'windvector') {
                scene.remove(obj);
                console.log('removed windvector');
            }
        }
    }

	// TOGGLE CONTOURS //TODO: Reuse or remove this code somehow
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
	$('#resetButton').on('click', function() {
        if (animating) {
            stopAnimation();
            $('#animateButton').html('Animate');
        }

		clearArrows();


		// Reset toggles
		//showContours = false;
		//showAxes = true;

		// Reset camera
		camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
		orbit.reset();

        dispIndexArray = dispIndexArray_reset.slice();
        dispIndexArray_follower = dispIndexArray_follower_reset.slice();
		//flycontrols.reset();
		/*
		if (!flyThroughEnabled)
		{
			controls.reset();
			console.log("Orbit Controls Reset");
		}
		*/
		// Reset terrain
		//texture.map = THREE.ImageUtils.loadTexture('resources/reliefHJAndrews.png');
		//terrainGeo.material = texture.map;

    // Reset Animation button

    // Reset current-timestamp-label
	    $("#current-timestamp-label").html("Scene Reset");


	});
});