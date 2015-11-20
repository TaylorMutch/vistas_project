/**
 * Created by Taylor on 9/8/2015.
 */

var VERSION ='1.0.1';

/** Our manager that holds everything together **/
var manager = new VisManager();

var terrains = [];
$.getJSON('/terrains/')
    .done(function(json) {
        $.each(json, function(id, item) {
            terrains.push(item);
        });
    }
);
$(document).ready(function() {
    /**
     * Our timeline slider.
     * Initialized to be disabled with dummy values because we don't know what the begin/end values are yet.
     * When enabled, the stop event triggers a render event based on the timestamp that it receives
     */
    $(function() {
        var s = $("#timelineSlider");
        s.slider({
            disabled: true,
            value:0,
            min: 0,
            max: 1,
            step: 1,
            slide: function( event, ui ) {
                $( "#amount" ).val( "$" + ui.value );
                if (manager.LiveUpdate) manager.UpdateTimeline(ui.value);
            },
            // This is triggered when a user picks up and drops the slider.
            stop: function( event, ui ) {
                if (!manager.LiveUpdate) manager.UpdateTimeline(ui.value);
            }
        });
        $( "#amount" ).val( "$" + s.slider("value"));
    });
    steal("leaa/js/CCapture.min.js", function() {});
    steal("leaa/js/whammy.js", function() {});
    steal("leaa/ui/settings.js", function() {});
    steal("leaa/ui/loader.js", function() {}); // Load rendering tools
    // Playback UI controls
    steal(function() {
        $('#forward').on('click', function() {
            manager.StepForward();
        });
        $('#back').on('click', function() {
            manager.StepBackward();
	    });

        $('#begin').on('click', function() {
            manager.ResetStations();
        });
        // Enable animation
	    $('#play').on('click', function() {
            var glyph = $('#play-glyph');
            if (glyph.hasClass('glyphicon-play')) {
                manager.StepForward();
                manager.Animating = true;
                intervalID = setInterval(animateStepForward, 1000/4);
                glyph.removeClass('glyphicon-play');
                glyph.addClass('glyphicon-pause');
            } else {
                stopAnimation();
                glyph.removeClass('glyphicon-pause');
                glyph.addClass('glyphicon-play');
            }
	    });
        // Video recording
        $('#rec_btn').on('click', function() {
            var glyph = $('#play-glyph');
            if ($(this).hasClass('active')) {
                capturer.stop();
                capturer.save(function(blob) {
                    window.location = blob;
                });
                $(this).removeClass('active');
                glyph.removeClass('glyphicon-pause');
                glyph.addClass('glyphicon-play');
                alert('Video is now ready for pickup. Have a nice day!');
            } else {
                var proceed = confirm('Begin capturing scene? This will affect system performance, and may not work on all browsers');
                if (proceed) {
                    $(this).addClass('active');
                    capturer =  new CCapture( {format: 'webm', framerate: 10});
                    capturer.start();
                    manager.StepForward();
                    manager.Animating = true;
                    intervalID = setInterval(animateStepForward, 1000/2);
                    glyph.removeClass('glyphicon-play');
                    glyph.addClass('glyphicon-pause');
                }
            }
        });
        // Animation loop
        function animateStepForward() {
            manager.StepForward();
        }
        // Disable animation
        function stopAnimation() {
            manager.Animating = false;
            clearInterval(intervalID);
        }
	    // RESET
	    $('#reset').on('click', function() {
                if (manager.Animating) {
                    stopAnimation();
                }
                manager.ResetStations();
                orbit.reset();
                camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            }
        );
    });

    // Tooltips
    $(function() {
        $('[data-toggle="tooltip-std"]').tooltip({placement: 'right', container: 'body'})
    });
    $(function() {
        $('[data-toggle="tooltip"]').tooltip({container: 'body'})
    });
    $(function() {
        $('.dropdown-toggle').dropdown();
    });
    $("#closehowtomodal").click(function() {
        $("#howtovideo")[0].pause();
    })
});