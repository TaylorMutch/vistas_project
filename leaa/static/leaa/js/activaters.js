/**
 * Created by Taylor on 8/20/2015.
 */

$(function () {
   $('[data-toggle="tooltip-std"]').tooltip({placement: 'right', container: 'body'})
});
$(function () {
    $('[data-toggle="tooltip"]').tooltip({container: 'body'})
});
$(function () {
    $('.dropdown-toggle').dropdown();
});

// Add modal dropdown function
// Add howto video pause inside as well
/*
$(document).ready(function() {
    $('a.dem').click(function () {
        //temp_terrain = terrains[document.getElementById("#dem0").value];
        var temp_terrain = terrains[this.value];
        //console.log(index);
        //temp_terrain = terrains[index];
        //console.log(terrains);
        if (temp_terrain.name !== activeDEM) {
            if (activeDEM !== undefined) {
                cleanup();
            }
            $("#current-timestamp-label").html("Loading " + temp_terrain.name);
            activeDEM = name;
            //var MAPx = coordinates[0];
            //var MAPy = coordinates[1];
            //var DEMx = coordinates[2];
            //var DEMy = coordinates[3];
            //var maxHeight = coordinates[4];

            var MAPx = temp_terrain.MAPx;
            var MAPy = temp_terrain.MAPy;
            var DEMx = temp_terrain.DEMx;
            var DEMy = temp_terrain.DEMy;
            var maxHeight = temp_terrain.maxHeight;

            // Get initial terrain geo, to be updated with DEM data
            var plane = new THREE.PlaneGeometry(MAPx, MAPy, DEMx - 1, DEMy - 1);
            plane.computeFaceNormals();
            plane.computeVertexNormals();

            // Import texture //TODO: rewrite this texture code to import a THREE.Texture, fixes flipped texture problem.
            var texture = new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('static/leaa/resources/relief' + temp_terrain.name + '.png')});
            //var texture = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture('static/leaa/resources/jotunheimen-texture.jpg')});

            texture.flipY = true;
            // Edit the height to match the DEM we requested
            var heightMap = [];

            // Declare the final terrain object to be added
            var loader = new THREE.TerrainLoader(manager);
            loader.load('static/leaa/resources/dem' + temp_terrain.name + '.bin', function (data) {
                //loader.load('static/leaa/resources/jotunheimen.bin', function(data) {
                //console.log("Raw DEM data: " + data);
                for (var i = 0, l = plane.vertices.length; i < l; i++) {
                    //terrainGeo.vertices[i].z = data[i]/65535*1215;
                    plane.vertices[i].z = data[i] / 65535 * maxHeight;
                    heightMap[i] = data[i];
                }
                terrainGeo = new THREE.Mesh(plane, texture);
                scene.add(terrainGeo);
                //console.log("Heights: " + heightMap);
            });
            camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z);
            animate();
        }
    });
});
*/