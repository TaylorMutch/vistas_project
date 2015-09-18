/**
 * Created by Taylor on 9/8/2015.
 */
steal(function () {

    //var camera, scene, renderer, activeDEM, terrainGeo; //,terrainMap;
    var activeDEM;
    sceneObjects = [];
    var CAM_START = new THREE.Vector3(0,-80,80);
    var container = document.getElementById("scene");
    WIDTH = container.offsetWidth;
    HEIGHT = container.offsetHeight;

    //TODO: Remove these \/ global variables and replace them in the terrain -> model.py
    var MAX_UTMx = 572109.034; // rightmost
    var MIN_UTMx = 558369.034; // leftmost
    var MAX_UTMy = 4903953.876; //nortmost
    var MIN_UTMy = 4893633.876; //southmost
    // UTM stepsize is 30 meters per square
    var STEP_SIZE = 30; //TODO: Generalize this when we remove it


    init();
    render(); // One call to render to prep the workspace.

    // Retreives and renders selected terrain.
    $("a.dem").click(function() {
        var index = $(this).attr('value');   // index of the terrain we want
        temp_terrain = terrains[index];
        var name = temp_terrain.name;
        if (name !== activeDEM) {
            if (activeDEM !== undefined) {
                cleanup();
            }
            activeDEM = name;
            //console.log(temp_terrain);
            var MAPx = temp_terrain.MAPx;
            var MAPy = temp_terrain.MAPy;
            var DEMx = temp_terrain.DEMx;
            var DEMy = temp_terrain.DEMy;
            var maxHeight = temp_terrain.maxHeight;

            // Get initial terrain geo, to be updated with DEM data
            var plane = new THREE.PlaneGeometry(MAPx, MAPy, DEMx-1, DEMy-1);
            plane.computeFaceNormals();
            plane.computeVertexNormals();

    	    // Import texture //TODO: rewrite this texture code to import a THREE.Texture, fixes flipped texture problem.
	        var texture = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('static/leaa/resources/relief' + name +'.png')});

            texture.flipY = true;
	        // Edit the height to match the DEM we requested
            var heightMap = [];

    	    // Declare the final terrain object to be added
            var loader = new THREE.TerrainLoader();
            loader.load('static/leaa/resources/dem'+ name + '.bin', function(data) {
                // console.log("Raw DEM data: " + data);
                for (var i = 0, l = plane.vertices.length; i < l; i++ ) {
                    plane.vertices[i].z = data[i]/65535*maxHeight;
                    heightMap[i] = data[i];
                }
                terrainGeo = new THREE.Mesh(plane, texture);
                terrainMap = plane.vertices;
                scene.add(terrainGeo);
                sceneObjects.push(terrainGeo);

            //console.log("Heights: " + heightMap);
            });
            camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            //animate();
            $("#current-timestamp-label").html(name + "")
        }

        // Retreive stations
        index = temp_terrain.id; //TODO: Cleanup these stations declarations
        all_stations = [];
        temp_stations = [];
        stationPositions = [];
        $.getJSON('/stations/', function(json) {
            all_stations = json;
            $.each(all_stations, function(id, station) {
                if (station.terrain == index) {
                    temp_stations.push(station);
                }
            }); // Render stations
        }).done(function(temp_stations) {
            $.each(temp_stations, function(id, station) {
                // Create station in DEM
                var pos = terrainMap[(station.demY*temp_terrain.DEMx) + station.demX]; //TODO: Get the station vis_models working properly - redo/replace terrainMap?
                stationPositions.push(pos);
                //console.log(pos);
                var axes = new THREE.AxisHelper(20);
                axes.position = pos;
                scene.add(axes);
                sceneObjects.push(axes);
                var markerGeo = new THREE.BoxGeometry(1,1,1);
                var markerMat = new THREE.MeshBasicMaterial( {color: 0xcccccc});
                var marker = new THREE.Mesh(markerGeo, markerMat);
                marker.position = pos;
                scene.add(marker);
                sceneObjects.push(marker);
            });
        });
        // Animate the scene with all the correct stations loaded
        animate();

        //TODO: retrieve dataFiles and load up the correct HTML elements on the page.
        all_datafiles = [];
        temp_datafiles = [];
        $("#dataPicker").empty();
        $.getJSON('/datafiles/', function(json) { //TODO: Optimize how this retrieves dataFiles
            all_datafiles = json;
            $.each(temp_stations, function(station_id, station) {
                //console.log('Station ID: ' + station.id);
                $.each(all_datafiles, function(datafile_id, datafile) {
                    //console.log('Datafile Station: ' + datafile.station);
                    if (station.id == datafile.station) {
                        temp_datafiles.push(datafile);
                        $("#dataPicker").append('<li><a href="#" class="datafile" id=' + datafile.id +'>' + datafile.fileName + '</a></li>');
                        console.log("Loaded a file!");
                    }
                });
            });
        }).done(function () {
            if (temp_datafiles.length == 0) {
                console.log("No data found for this terrain");
                $("#dataPicker").append('<li>No data for this terrain</li>');
            }
        });
    });

    function init() {

        // Setup Camera
        //camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 1000);
        camera = new THREE.CombinedCamera(WIDTH, HEIGHT, 60, 0.1, 500, -500, 1000);
        camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
        camera.up.set(0,0,1);

        // Setup Scene
        scene = new THREE.Scene();
        var ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        // Initialze controls
        orbit = new THREE.OrbitControls(camera, container);

        // Declare renderer settings
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0xfefefe, 1);
        renderer.autoClear = true;
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        WIDTH = container.offsetWidth;
        HEIGHT = container.offsetHeight;
        camera.aspect = WIDTH/HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(WIDTH, HEIGHT);
    }

    function cleanup() {
        //$.each(sceneObjects, function(threeObject) {
            //scene.remove(threeObject);
            //console.log("Removed object");
        //});
        scene.remove(terrainGeo);
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

});