import { Vec2 } from "../types/vector";
import { DegreesToRadians } from "./math"

namespace WGSConstants {
	export const EARTH_MAJOR_AXIS = 6378137.0;
	export const EARTH_FIRST_ECCENTRICITY_SQUARED = 0.00669437999014;
	export const EARTH_SPHERICAL_RADIUS = 6378137;
}

export const GeodeticToENUSimpleApproximation = (pos: Vec2, base: Vec2): Vec2 => {
	/*
	 * DG See
	 * https://stackoverflow.com/questions/17402723/function-that-converts-
	 * gps-coordinates-to-enu-coordinates Particularly the local, flat earth
	 * approximation
	 */
	const radLat = DegreesToRadians(pos.x);
	const radLon = DegreesToRadians(pos.y);
	const radBaseLat = DegreesToRadians(base.x);
	const radBaseLon = DegreesToRadians(base.y);
	const distNorth = (WGSConstants.EARTH_MAJOR_AXIS * (1 - WGSConstants.EARTH_FIRST_ECCENTRICITY_SQUARED) / Math
		.pow(1 - WGSConstants.EARTH_FIRST_ECCENTRICITY_SQUARED * Math.pow(Math.sin(radBaseLat), 2), 3.0 / 2))
		* (radLat - radBaseLat);
	const distEast = (WGSConstants.EARTH_MAJOR_AXIS
		/ Math.sqrt(1 - WGSConstants.EARTH_FIRST_ECCENTRICITY_SQUARED * Math.pow(Math.sin(radBaseLat), 2)))
		* Math.cos(radBaseLat) * (radLon - radBaseLon);
	return { x: distEast, y: distNorth };
}

// export const LatitudeLongitudeToMeters = (latitude: Vec2, longitude: Vec2): Vec2 => {
//     var R = 6378.137; // Radius of earth in KM
//     var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
//     var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
//     var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon/2) * Math.sin(dLon/2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     var d = R * c;
//     return d * 1000; // meters
// }
