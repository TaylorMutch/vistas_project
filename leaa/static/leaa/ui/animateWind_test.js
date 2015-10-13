/**
 * Created by Taylor on 9/10/2015.
 */
steal(function () {

	$('#stepForward').on('click', function() {
	    manager.StepForward();
    });


    function stepForward() {
        clearArrows();
        if (!isMaxed) {
            var isDecreasing = false;
            console.log('Rendering: ' + dispIndexArray);
            var stationsToRender = compareDates(dispIndexArray, isDecreasing);
            if (stationsToRender.length !== 0) {
                $.each(stationsToRender, function (id, stationIndex) {
                    renderArrows(stationIndex, dispIndexArray);
                    dispIndexArray[stationIndex] = dispIndexArray[stationIndex] + 1;
                    updateFollowers(stationIndex, isDecreasing);
                });
                console.log('Next set to render: ' + dispIndexArray)
            }
        }
    }

	$('#stepBack').on('click', function() {
        manager.StepBackward();
	});

	function stepBack() { //TODO: Bug fixing - doesn't step back properly yet
		clearArrows();
        if (dispIndexArray_follower !== dispIndexArray_follower_reset) {
            var isDecreasing = true;
            console.log('Rendering: ' + dispIndexArray_follower);
            var stationsToRender = compareDates(dispIndexArray_follower, isDecreasing);
            if (stationsToRender.length !== 0) {
                //console.log(dispIndexArray);
                var temp_followers = dispIndexArray_follower.slice();
                $.each(stationsToRender, function (id, stationIndex) {
                    renderArrows(stationIndex, dispIndexArray_follower);
                    updateFollowers(stationIndex, isDecreasing);
                });
                dispIndexArray = temp_followers.slice();
            }
        }
	}

    $('#beginStep').on('click', function() {
        manager.ResetStations();
        manager.StepForward();
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

    // Enable animation
	$('#animateButton').on('click', function() {
        if (animating) {
            stopAnimation();
            $(this).html('Animate')
        }
        else {
            manager.StepForward();
            animating = true;
            intervalID = setInterval(animateStepForward, 1000/4);
            $(this).html('Stop Animating')
        }
	});

    // Animation loop
    function animateStepForward() {
        manager.StepForward();
    }

    // Disable animation
    function stopAnimation() {
        animating = false;
        clearInterval(intervalID);
    }


	/*
	Returns a list of station indices to determine whether we render that station on this date
	 */
    /*
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
            updateSodarLog('Timestamp: ' + formatTimestamp(Math.max.apply(Math, datesToCompare)), true);
            //Otherwise, we need to get the precise stations that need updating and render them.
		} else {
            var checkDate;
            if (isDecreasing) {   //stepBack branch
                checkDate = Math.max.apply(Math, datesToCompare);
                updateSodarLog('Timestamp: ' + formatTimestamp(checkDate), true);
            } else {    // stepForward branch
                console.log('Date mismatch');
                checkDate = Math.min.apply(Math, datesToCompare);
                updateSodarLog('Timestamp: ' + formatTimestamp(checkDate), true);
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
    */
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