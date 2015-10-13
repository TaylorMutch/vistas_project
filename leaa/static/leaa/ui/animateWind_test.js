/**
 * Created by Taylor on 9/10/2015.
 */
steal(function () {
	$('#stepForward').on('click', function() {
	    manager.StepForward();
    });
    $('#stepBack').on('click', function() {
        manager.StepBackward();
	});
    $('#beginStep').on('click', function() {
        manager.ResetStations();
    });

    /**
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
	// RESET
	$('#resetButton').on('click', function() {
        if (animating) {
            stopAnimation();
            $('#animateButton').html('Animate');
        }
        manager.ResetStations();
		// Reset toggles
		//showContours = false;

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

	});
});