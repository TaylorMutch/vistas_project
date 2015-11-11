/**
 * Created by Taylor on 9/8/2015.
 */
steal(function () {

    init();
    render(); // One call to render to prep the workspace.


    /**
     * Initialize our workspace
     */
    function init() {
        CAM_START = new THREE.Vector3(0,-80,80);
        container = document.getElementById("scene");

        // Setup Camera
        camera = new THREE.CombinedCamera(container.offsetWidth, container.offsetHeight, 60, 0.1, 500, -500, 1000);
        camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
        camera.up.set(0,0,1);

        // Setup Scenes
        scene = new THREE.Scene();
        wind = new THREE.Scene();
        ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        initGUIS();

        // Declare renderer settings
        renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true}); // preserving is necessary for screenshot
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0x000000, 1);
        renderer.autoClear = false;     // Necessary for drawing 'wind' scene on top of terrain
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
        THREEx.Screenshot.bindKey(renderer);

        // Initialze controls
        orbit = new THREE.OrbitControls(camera, renderer.domElement);

    }
    /** Draws the DEM with new specified values.
     * Redraws the arrows based on new station base postition
     **/
    function redrawDEM() {
        for (var i = 0; i < manager.rawDEM.length; i++) {
            terrainGeo.geometry.vertices[i].z = manager.rawDEM[i]/65535 * manager.ActiveDEM.maxHeight * manager.SceneHeight;
        }
        terrainGeo.geometry.verticesNeedUpdate = true;
        clearArrows();
        $.each(manager.ActiveStations, function(id, station) {
            renderArrows(station);
        })
    }

    function initGUIS(){

        // Add performance monitor
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0%';
        stats.domElement.style.bottom = '0%';
        container.appendChild(stats.domElement);

        // GUIs
        var h = document.createElement("DIV");
        h.style.position = 'relative';
        h.id = 'horizontal-gui';

        //TODO: Replace this with our starting values
        var terrainNames = ['No Terrain'];
        $.each(terrains, function(id, handle) {
            terrainNames.push(handle.name);
        });

         // Horizontal GUI, used for setting terrain and views - global options
        h_gui = new dat.GUI({autoPlace: false});
        var h_params = {
            'Select Terrain': 'Null',   // because dat.GUI is kinda broken...
            'Save View': function() {
                if (manager.ActiveDEM != undefined) {
                    var name = prompt('Please give this view a name.');
                    if (name !== null && name !== "") {
                        var view = {
                            name: name,
                            pos: camera.position
                        };
                        manager.TerrainViews.push(view);
                        $("#viewPicker").append('<li><a href="#" class="terrainView">' + name + '</a></li>');
                        var save_to_server = confirm('Would you like to save this to the server?');
                        if (save_to_server) {
                            var saved_view = JSON.parse(JSON.stringify(view));
                            saved_view.terrain = manager.ActiveDEM.id;
                            var http = new XMLHttpRequest();
                            var params = 'name=' + name
                                + "&x=" + saved_view.pos.x.toString()
                                + "&y=" + saved_view.pos.y.toString()
                                + "&z=" + saved_view.pos.z.toString()
                                + "&terrainID=" + saved_view.terrain.toString();
                            http.open("POST", "/saveTerrainView/", true);
                            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                            http.send(params);
                        }
                        else {
                            dirty_views = true;
                        }
                    }
                }
            }
        };

        var Terrain = h_gui.addFolder('Terrain', "a");
        Terrain.add(h_params, 'Select Terrain', terrainNames) //TODO: Simplify the logic in this function
                /**
                 * Retrieves a selected DEM from our list of terrains.
                 * */
            .onChange(function(value) {
                if (value == 'No Terrain') { // Either we had no terrain to start with or we need to clear everything from the scene
                    clearArrows();
                    cleanup();
                    manager.ActiveDEM = undefined;
                    manager.rawDEM = undefined;
                    manager.ActiveStations = [];
                    $('#timelineSlider').slider('option', 'disabled', true);
                    $('.playback').addClass('disabled');
                } else {
                    for (var i = 0; i < terrains.length; i++) {
                        if (terrains[i].name == value) {
                            temp_terrain = terrains[i];
                            break;
                        }
                    }
                    var name = temp_terrain.name;

                    if (temp_terrain !== manager.ActiveDEM) {   // We have a terrain, so start process
                        $('#timelineSlider').slider('option', 'disabled', true);
                        if (manager.ActiveDEM !== undefined) {  // If this isn't the first terrain, cleanup.
                            clearArrows();
                            cleanup();
                        }
                        manager.ActiveDEM = temp_terrain;

                        // Get initial terrain geo, to be updated with DEM data
                        var plane = new THREE.PlaneGeometry(temp_terrain.MAPx, temp_terrain.MAPy, temp_terrain.DEMx - 1, temp_terrain.DEMy - 1);
                        plane.computeFaceNormals();
                        plane.computeVertexNormals();

                        // Load the terrain and all stations
                        manager.TerrainLoader.load('getTerrain/?terrainID=' + temp_terrain.id, function (data) {
                            manager.rawDEM = data;
                            var i;
                            for (i = 0, l = plane.vertices.length; i < l; i++) {
                                plane.vertices[i].z = data[i] / 65535 * temp_terrain.maxHeight * manager.SceneHeight;
                            }
                            var max = 0;
                            for (i = 0; i < plane.vertices.length; i++) {
                                if (plane.vertices[i].z > max) {
                                    max = plane.vertices[i].z;
                                }
                            }
                            // TODO: Sort out this shader before we use it...
                            var shaderMaterial = new THREE.ShaderMaterial({
                                uniforms: {
                                    displacement: {type: 'f', value: manager.SceneHeight},
                                    max_height: {type: 'f', value: max}
                                },
                                fragmentShader: ["uniform float max_height;",
                                    "varying float height;",
                                    "vec3 color_from_height( const float height ) {",
                                    "vec3 terrain_colours[4];",
                                    "terrain_colours[0] = vec3(0.0,0.0,0.6);",
                                    "terrain_colours[1] = vec3(0.1, 0.3, 0.1);",
                                    "terrain_colours[2] =  vec3(0.4, 0.8, 0.4);",
                                    "terrain_colours[3] = vec3(1.0,1.0,1.0);",
                                    "if (height < 0.0)",
                                    "return terrain_colours[0];",
                                    "else {",
                                    "float hscaled = height*2.0 - 1e-05; // hscaled should range in [0,2)",
                                    "int hi = int(hscaled); // hi should range in [0,1]",
                                    "float hfrac = hscaled-float(hi); // hfrac should range in [0,1]",
                                    "if( hi == 0)",
                                    "return mix( terrain_colours[1],terrain_colours[2],hfrac);",
                                    "else return mix( terrain_colours[2],terrain_colours[3],hfrac);",
                                    "} return vec3(0.0,0.0,0.0); }",
                                    "void main() {",
                                    "float norm_height = height/max_height;",
                                    "vec3 myColor = color_from_height(norm_height);",
                                    "gl_FragColor = vec4(myColor, 1.0);",
                                    "}"].join("\n"),
                                vertexShader: ["uniform float displacement;",
                                    "varying float height;",
                                    "void main() {",
                                    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x,position.y,position.z*displacement, 1.0);",
                                    "height = position.z;",
                                    "}"].join("\n")
                            });
                            // TODO: Work on shader
                            //terrainShader = new THREE.Mesh(plane, shaderMaterial);
                            //scene.add(terrainShader);
                            //manager.SceneObjects.push(terrainShader);
                            //terrainShader.visible = false;
                            material = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('media/' + name + '/' + name + '.png')});
                            terrainGeo = new THREE.Mesh(plane, material);
                            terrainGeo.name = 'terrain poly';
                            manager.TerrainMap = plane.vertices.slice(); //copy the vertices so we have a way to get back to normal
                            scene.add(terrainGeo);
                            updateSodarLog('Added terrain: ' + temp_terrain.name, false);
                            manager.SceneObjects.push(terrainGeo);
                            // Get the related recordDates
                            $("#dataPicker").empty();
                            var dates;
                            $.getJSON('/getDates/', {'terrainID': temp_terrain.id}, function (result) {
                                dates = result['dates'];
                                stationNames = result['stationNames'];
                            }).done(function () {
                                if (dates.length != 0) {
                                    dates.sort();
                                    console.log("Data found, adding to \"Select Data\" dropdown.");
                                    $.each(dates, function (id, name) {
                                        //$("#dataPicker").append('<li><a href="#" class="recordDate">' + name + '</a></li>');
                                        manager.Dates.push(name);
                                    });
                                } else {
                                    console.log('No Data Found');
                                }
                            })
                        });
                        camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
                        getSettings(manager.ActiveDEM.id);
                        getTerrainViews(manager.ActiveDEM.id);
                        animate();

                        // Do any DOM element changes we need to do.
                        $("#current-timestamp-label").html(name + "");
                    }
                }
            }
        );
        Terrain.add(manager, 'Dates',manager.Dates).onChange( //TODO - broken, get to fixin'!
            function(value) {
                var recordDate = value;
                if (recordDate !== manager.RecordDate && recordDate !== 'No Date Selected') {
                    clearArrows();
                    manager.RecordDate = recordDate;
                    $.getJSON('/getStationObjects/', {'stations[]': stationNames, 'recordDate': recordDate})
                        .done(function (response) {
                            manager.ActiveStations = [];
                            $.each(response, function (station, data) {
                                manager.ActiveStations.push(new Station(data));
                            });
                            $.each(manager.ActiveStations, function (id, station) {
                                station.pos = manager.TerrainMap[(station.demY * manager.ActiveDEM.DEMx) + station.demX];
                                renderArrows(station);
                            });

                            // Get the beginning and ending days from each station, and then set the timeline
                            var minDates = [];
                            var maxDates = [];
                            $.each(manager.ActiveStations, function (id, station) {
                                minDates.push(Math.min.apply(Math, station.dates));
                                maxDates.push(Math.max.apply(Math, station.dates));
                            });
                            var step1 = '20' + manager.ActiveStations[0].dates[0].toString();
                            var step2 = '20' + manager.ActiveStations[0].dates[1].toString();
                            var max = '20' + Math.max.apply(Math, maxDates).toString();
                            var min = '20' + Math.min.apply(Math, minDates).toString();

                            /**
                             * Initialize our timeline with the desired dates in Date() objects.
                             */
                            manager.Timeline.beginTime = new Date(+min.substr(0, 4), +min.substr(4, 2) - 1, +min.substr(6, 2),
                                +min.substr(8, 2), +min.substr(10, 2), +min.substr(12, 2));
                            manager.Timeline.endTime = new Date(+max.substr(0, 4), +max.substr(4, 2) - 1, +max.substr(6, 2),
                                +max.substr(8, 2), +max.substr(10, 2), +max.substr(12, 2));
                            manager.Timeline.currentTime = manager.Timeline.beginTime;

                            //calculate timeStep
                            var date1 = new Date(+step1.substr(0, 4), +step1.substr(4, 2) - 1, +step1.substr(6, 2),
                                +step1.substr(8, 2), +step1.substr(10, 2), +step1.substr(12, 2));
                            var date2 = new Date(+step2.substr(0, 4), +step2.substr(4, 2) - 1, +step2.substr(6, 2),
                                +step2.substr(8, 2), +step2.substr(10, 2), +step2.substr(12, 2));
                            manager.Timeline.timeStep = date2.getTime() - date1.getTime();
                            manager.Timeline.numSteps = (
                                manager.Timeline.endTime.getTime()
                                - manager.Timeline.beginTime.getTime()) /
                                manager.Timeline.timeStep;

                            // Enable the timeline and playback controls
                            $('#timelineSlider').slider({
                                disabled: false,
                                value: manager.Timeline.beginTime.getTime(),
                                min: manager.Timeline.beginTime.getTime(),
                                max: manager.Timeline.endTime.getTime(),
                                step: manager.Timeline.timeStep
                            });
                            $('.playback').removeClass('disabled');

                            // Initialize our initial values for this set of data.
                            manager.CurrentTimestamp = manager.Timeline.beginTime.getTime();
                            manager.CurrentDate = calcTimestep(manager.CurrentTimestamp);
                        }
                    );
                    $("#current-timestamp-label").html(manager.ActiveDEM.name + ': ' + recordDate);
                    updateSodarLog('Loaded records from: ' + recordDate, false);
                }
                console.log(recordDate);
            }
        );
        var Views = h_gui.addFolder('Views', "a");
        Views.add(manager,'TerrainViews',manager.TerrainViews).listen()
            .onChange(function(value) {
                var name = value;
                var i;
                for (i = 0; i < manager.TerrainViews.length; i++) {
                    if (manager.TerrainViews[i].name == name) break;
                }
                var view = manager.TerrainViews[i];
                orbit.reset();
                camera.position.x = view.pos.x;
                camera.position.y = view.pos.y;
                camera.position.z = view.pos.z;
            });
        Views.add(h_params,'Save View');
        h.appendChild(h_gui.domElement);
        container.appendChild(h);
        h_gui.domElement.style.position = 'absolute';
        h_gui.domElement.style.top = '0%';
        h_gui.domElement.style.left = '0%';

        // Vertical GUI, for setting scene options
        var v_gui = new dat.GUI({autoPlace: false});
        var v_params = {
            'Camera Type': 'camera',
            'Toggle Wireframe': function() {
                terrainGeo.material.wireframe = !terrainGeo.material.wireframe;
            },
            'Save Settings': function() {
                var save_to_server = confirm('Save current settings to the server?');
                if (save_to_server) {
                    var http = new XMLHttpRequest();
                    http.open("POST", "/setSettings/", true);
                    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    var liveUpdate = (manager.LiveUpdate == true) ? 1 : 0;
                    var params = "live=" + liveUpdate.toString()
                        + "&color=" + manager.ArrowColor.toString()
                        + "&vheight=" + manager.VectorHeight.toString()
                        + "&vlength=" + manager.VectorLength.toString()
                        + "&sheight=" + manager.SceneHeight.toString()
                        + "&terrainID=" + manager.ActiveDEM.id.toString();
                    http.send(params);
                }
            }
        };
        var wvcontrols = v_gui.addFolder('Wind Vector Controls', "a");
        wvcontrols.add(manager, 'VectorHeight',.5, 2).listen().onChange(
            function() {
                clearArrows();
                drawArrows();
            }
        );
        wvcontrols.add(manager, 'VectorLength',.5, 2).listen().onChange(
            function() {
                clearArrows();
                drawArrows();
            }
        );
        wvcontrols.addColor(manager, 'ArrowColor').onChange(
            function(value) {
                manager.ArrowColor = value;
                $.each(wind.children, function(id, vector) {
                    // Sometimes windvectors dont have lines attached (I.e. vectorLength == 0)
                    if (vector.children.length == 2) {
                        vector.line.material.color = new THREE.Color(value);
                    }
                })
            }
        );
        wvcontrols.add(manager, 'LiveUpdate').listen();
        var elevcontrols = v_gui.addFolder('Terrain Controls', "a");
        elevcontrols.add(manager, 'SceneHeight',.5,2).listen().onChange(
            function() {
                if (manager.rawDEM != undefined) {
                    clearArrows();
                    redrawDEM();
                    drawArrows();
                }
            }
        );
        elevcontrols.add(v_params, 'Camera Type', ['Perspective', 'Orthographic']).onChange(
            function(value){
                if (value == 'Orthographic') {
                    camera.toOrthographic();
                } else if (value == 'Perspective') {
                    camera.toPerspective();
                } else {
                    alert('Failure');
                }
            }
        );
        elevcontrols.add(v_params, 'Toggle Wireframe');
        var miscOptions = v_gui.addFolder('Options', 'a');
        miscOptions.add(v_params, 'Save Settings');
        v_gui.domElement.style.position='absolute';
        v_gui.domElement.style.top = '0%';
        v_gui.domElement.style.right = '0%';
        v_gui.open();
        container.appendChild(v_gui.domElement);

        var wr_div = document.createElement('DIV');
        var wr_img = new Image();
        wr_img.onload = function() {
            wr_div.appendChild(wr_img);
        };
        wr_img.src = '/static/leaa/resources/quick_windrose.png';
        wr_div.style.position='absolute';
        wr_div.style.bottom = '0%';
        wr_div.style.right = '0%';
        container.appendChild(wr_div);
    }


    /**
     * Our resizeing function
     */
    function onWindowResize() { // Using CombinedCamera API
        camera.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        camera.updateProjectionMatrix();
    }

    /**
     * Remove all objects from scene and render once to clear UI.
     */
    function cleanup() {
        $.each(manager.SceneObjects, function(handle, threeObject) {
            scene.remove(threeObject);
            renderer.dispose(threeObject);
            delete manager.SceneObjects.pop();
        });
        console.log("Scene cleared");
        render();
    }

    function animate() {
        requestAnimationFrame(animate);
        stats.update();
        render();
    }

    function render() {
        orbit.update();
        renderer.clear();
        renderer.render(scene,camera);
        renderer.clearDepth();
        renderer.render(wind,camera);
    }
});