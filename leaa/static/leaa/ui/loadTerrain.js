/**
 * Created by Taylor on 9/8/2015.
 */
steal(function () {


    init();
    render(); // One call to render to prep the workspace.

    /**
     * Retrieves a selected DEM from our list of terrains.
     */
    //$("a.dem").click(function() {
    $("ul").on('click', 'a.dem', function() {
        /** Go get the new terrain or just pass over everything */
        var index = $(this).attr('value');   // index of the terrain we want
        temp_terrain = terrains[index];
        var name = temp_terrain.name;
        if (temp_terrain !== manager.ActiveDEM) {
            $('#timelineSlider').slider('option','disabled',true);
            $('#sceneHeight').slider({disabled: false, value: 1});
            $('#vectorHeight').slider({disabled: true, value: 1});
            $('#vectorLength').slider({disabled: true, value: 1});
            if (manager.ActiveDEM !== undefined) {
                clearArrows();
                cleanup();
            }
            manager.ActiveDEM = temp_terrain;

            // Get initial terrain geo, to be updated with DEM data
            var plane = new THREE.PlaneGeometry(temp_terrain.MAPx, temp_terrain.MAPy, temp_terrain.DEMx-1, temp_terrain.DEMy-1);
            plane.computeFaceNormals();
            plane.computeVertexNormals();

    	    // Import texture //TODO: rewrite this texture code to import a THREE.Texture, fixes flipped texture problem.
	        //texture = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('static/leaa/resources/' + name +'.png')});
            texture = new THREE.MeshBasicMaterial({color: 0xa9a9a9});
            wire = new THREE.MeshPhongMaterial({
                color: 0xbbbbbb,
                wireframe: true
            });
            //texture.flipY = true;

            // Load the terrain and all stations
            manager.TerrainLoader.load('static/leaa/resources/'+ name + '.bin', function(data) {
                manager.rawDEM = data;
                for (var i = 0, l = plane.vertices.length; i < l; i++ ) {
                    plane.vertices[i].z = data[i]/65535*temp_terrain.maxHeight;
                }
                terrainGeo = new THREE.Mesh(plane, texture);
                terrainGeo.name = 'terrain poly';
                manager.TerrainMap = plane.vertices.slice(); //copy the vertices so we have a way to get back to normal
                scene.add(terrainGeo);
                updateSodarLog('Added terrain: ' + temp_terrain.name, false);
                manager.SceneObjects.push(terrainGeo);
                terrainWire = new THREE.Mesh(plane, wire);
                terrainWire.name = 'terrain wireframe';
                manager.SceneObjects.push(terrainWire);
                // Get the related recordDates
                $("#dataPicker").empty();
                $.getJSON('/getDates/', {'terrainID': temp_terrain.id}, function(result) {
                    dates = result['dates'];
                    stationNames = result['stationNames'];
                }).done(function() {
                    if (dates.length == 0) {
                        console.log("No data found for this terrain. Pick another terrain for data viewing.");
                        $("#dataPicker").append('<li>No data for this terrain</li>');
                    } else {
                        console.log("Data found, adding to \"Select Data\" dropdown.");
                        $.each(dates, function(id, name) {
                            $("#dataPicker").append('<li><a href="#" class="recordDate">' + name + '</a></li>');
                        });
                    }
                })
            });
            camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            animate();
            $("#current-timestamp-label").html(name + "")
        }
    });

    /**
     * Initialize our workspace
     */
    function init() {
        manager = new VisManager();
        CAM_START = new THREE.Vector3(0,-80,80);
        container = document.getElementById("scene");

        // Setup Camera
        camera = new THREE.CombinedCamera(container.offsetWidth, container.offsetHeight, 60, 0.1, 500, -500, 1000);
        camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
        camera.up.set(0,0,1);

        // Setup Scene
        scene = new THREE.Scene();
        ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        // Initialze controls
        orbit = new THREE.OrbitControls(camera, container);

        // Declare renderer settings
        renderer = new THREE.WebGLRenderer({preserveDrawingBuffer : true});
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        //renderer.setClearColor(0xfefefe, 1);
        renderer.setClearColor(0x000000, 1);
        renderer.autoClear = true;
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
        THREEx.Screenshot.bindKey(renderer);
    }
    /** Draws the DEM with new specified values.
     * Doesn't touch the arrows, as those are desired to be independent.
     **/
    function redrawDEM() {
        for (var i = 0; i < manager.rawDEM.length; i++) {
            terrainGeo.geometry.vertices[i].z = manager.rawDEM[i]/65535 * manager.ActiveDEM.maxHeight * manager.SceneHeight;
        }
        terrainGeo.geometry.verticesNeedUpdate = true;
    }

    /**
     * Our resizeing function TODO: Improve this as some of the page feels glitchy
     */
    function onWindowResize() {
        camera.aspect = container.offsetWidth/container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    /**
     * Remove all objects from scene and render once to clear UI.
     */
    function cleanup() {
        $.each(manager.SceneObjects, function(handle, threeObject) {
            scene.remove(threeObject);
            delete manager.SceneObjects.pop();
        });
        console.log("Scene cleared");
        render();
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        orbit.update();
        renderer.render(scene,camera);
    }

    $("#setOrthographic").click(function () {
        camera.toOrthographic();
    });
    $("#setPerspective").click(function () {
        camera.toPerspective();
    });


    //TODO: See if we need this for adding arbitrary stations
    function calcStationPos(utmX, utmY) {
        var coords = [];
        var x = Math.floor(utmX - MIN_UTMx)/STEP_SIZE;
        coords.push(x);
        var y = Math.floor(MAX_UTMy - utmY)/STEP_SIZE;
        coords.push(y);
        return coords;
    }

    /**
     * Toggle wireframe
     */
    $('#wireframeToggle').on('click', function() {
        var obj, i;
        if (manager.ShowWireFrame) {
            for (i = scene.children.length - 1; i >= 0; i--) {
                obj = scene.children[i];
                if (obj.name == 'terrain wireframe') {
                    scene.remove(obj);
                    break;
                }
            }
            manager.ShowWireFrame = false;
            scene.add(terrainGeo);
        }
        else {
            for (i = scene.children.length - 1; i >= 0 ; i--) {
                obj = scene.children[i];
                if (obj.name == 'terrain poly') {
                    scene.remove(obj);
                    break;
                }
            }
            manager.ShowWireFrame = true;
            scene.add(terrainWire);
        }
    });

    /**
     * Elevation slider
     * Calls WebGL to render the scene with the adjusted DEM
     */
    $(function() {
        $("#sceneHeight").slider({
            disabled: true,
            value:1,
            min:.1,
            max: 2.0,
            step: .1,
            slide: function(event, ui) {
                $( "#amount").val("$"+ui.value);
            },
            stop: function(event,ui) {
                if (ui.value !== manager.SceneHeight) { //redraw only if the value is changed
                    manager.SceneHeight = ui.value;
                    redrawDEM();
                }
            }
        });
        $("#amount").val("$" + $("#sceneHeight").slider("value"));
    });
});