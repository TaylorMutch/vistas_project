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
            if (manager.ActiveDEM !== undefined) {
                clearArrows();
                cleanup();
            }
            manager.ActiveDEM = temp_terrain;

            // Get initial terrain geo, to be updated with DEM data
            var plane = new THREE.PlaneGeometry(temp_terrain.MAPx, temp_terrain.MAPy, temp_terrain.DEMx-1, temp_terrain.DEMy-1);
            plane.computeFaceNormals();
            plane.computeVertexNormals();

            // Load the terrain and all stations
            manager.TerrainLoader.load('getTerrain/?terrainID=' + temp_terrain.id, function(data) {
                manager.rawDEM = data;
                var i;
                for (i = 0, l = plane.vertices.length; i < l; i++ ) {
                    plane.vertices[i].z = data[i]/65535*temp_terrain.maxHeight*manager.SceneHeight;
                }
                var max = 0;
                for (i = 0; i < plane.vertices.length; i++) {
                    if (plane.vertices[i].z > max) {
                        max = plane.vertices[i].z;
                    }
                }
                // TODO: Sort out this shader before we use it...
                var shaderMaterial = new THREE.ShaderMaterial({uniforms: {
                    displacement:{type:'f',value: manager.SceneHeight},
                       max_height:{type:'f', value: max }
                    },
                    fragmentShader:
                        ["uniform float max_height;",
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
                    vertexShader:
                        ["uniform float displacement;",
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
                material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('media/'+name+'/'+name+'.png')});
                terrainGeo = new THREE.Mesh(plane, material);
                terrainGeo.name = 'terrain poly';
                manager.TerrainMap = plane.vertices.slice(); //copy the vertices so we have a way to get back to normal
                scene.add(terrainGeo);
                updateSodarLog('Added terrain: ' + temp_terrain.name, false);
                manager.SceneObjects.push(terrainGeo);
                // Get the related recordDates
                $("#dataPicker").empty();
                var dates;
                $.getJSON('/getDates/', {'terrainID': temp_terrain.id}, function(result) {
                    dates = result['dates'];
                    stationNames = result['stationNames'];
                }).done(function() {
                    if (dates.length == 0) {
                        console.log("No data found for this terrain. Pick another terrain for data viewing.");
                        $("#dataPicker").append('<li>No data for this terrain</li>');
                    } else {
                        dates.sort();
                        console.log("Data found, adding to \"Select Data\" dropdown.");
                        $.each(dates, function(id, name) {
                            $("#dataPicker").append('<li><a href="#" class="recordDate">' + name + '</a></li>');
                        });
                    }
                })
            });
            camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            animate();

            // Do any DOM element changes we need to do.
            $("#current-timestamp-label").html(name + "");
        }
    });

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

        // Add performance monitor
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.right = '0%';
        stats.domElement.style.bottom = '0%';
        container.appendChild(stats.domElement);

        // GUIs
        var h = document.createElement("DIV");
        h.style.position = 'relative';
        h.id = 'horizontal-gui';

        //TODO: Replace this with our starting values
        var obj = {
            x:5,
            y:5,
            'Z Translate': 0.5,
            Color:"rgba(228,30,0,0.3)",
            Interpolation: 0,
            Yes: true
        };

        h_gui = new dat.GUI({autoPlace: false});
        var Coordinates = h_gui.addFolder('Coordinates..', "a");
        Coordinates.add(obj, 'x');
        Coordinates.add(obj, 'y');
        var Options = h_gui.addFolder('Options..', "a");
        Options.addColor(obj, 'Color');
        Options.add(obj, 'Z Translate', 0.0, 1.0);
        h.appendChild(h_gui.domElement);
        container.appendChild(h);
        h_gui.domElement.style.position = 'absolute';
        h_gui.domElement.style.top = '0%';
        h_gui.domElement.style.left = '0%';
        //h_gui.remember(Options);

        v_gui = new dat.GUI({autoPlace: false});
        var v_params = {
            'Camera Type': 'camera',
            'Toggle Wireframe': function() {
                terrainGeo.material.wireframe = !terrainGeo.material.wireframe;
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
        wvcontrols.add(manager, 'SceneHeight',.5,2).listen().onChange(
            function() {
                clearArrows();
                redrawDEM();
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
        wvcontrols.add(v_params, 'Camera Type', ['Perspective', 'Orthographic']).onChange(
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
        wvcontrols.add(v_params, 'Toggle Wireframe');
        wvcontrols.add(manager, 'LiveUpdate').listen();
        v_gui.domElement.style.position='absolute';
        v_gui.domElement.style.top = '0%';
        v_gui.domElement.style.right = '0%';
        v_gui.open();
        container.appendChild(v_gui.domElement);
        //v_gui.remember(wvcontrols);

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

    /**
     * Our resizeing function TODO: Improve this as some of the page feels glitchy
     */
    function onWindowResize() {
        camera.aspect = container.offsetWidth/container.offsetHeight;
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