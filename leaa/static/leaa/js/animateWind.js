/**
 * Created by Taylor on 9/10/2015.
 */
steal(function () {






    function makeVector(stationPos, cSpeed, cDirection, cHeight) {
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

});