/**********************************************************************************/
/* Copyright (c) 2021 Rhombus Systems 						  */
/* 										  */
/* Permission is hereby granted, free of charge, to any person obtaining a copy   */
/* of this software and associated documentation files (the "Software"), to deal  */
/* in the Software without restriction, including without limitation the rights   */
/* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      */
/* copies of the Software, and to permit persons to whom the Software is          */
/* furnished to do so, subject to the following conditions: 			  */
/* 										  */
/* The above copyright notice and this permission notice shall be included in all */
/* copies or substantial portions of the Software.  				  */
/* 										  */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     */
/* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       */
/* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    */
/* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         */
/* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  */
/* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  */
/* SOFTWARE. 									  */
/**********************************************************************************/

import { Vec2 } from "../types/vector";
import { DegreesToRadians } from "./math"


/*
  *
  * @export 
  * @method Converts Latitude and Longitude to meters
  *
  * @param {Vec2} [pos] The latitude longitude position to convert to a distance
  * @param {Vec2} [base] The latitude longitude position which `pos` will be compared to in meters
  *
  * @return {Vec2} Returns an approximation in meters of how far `pos` is from `base`
  * */
export const GeodeticToENUSimpleApproximation = (pos: Vec2, base: Vec2): Vec2 => {

	// See https://stackoverflow.com/questions/17402723/function-that-converts-gps-coordinates-to-enu-coordinates for more info

	const EARTH_MAJOR_AXIS = 6378137.0;
	const EARTH_FIRST_ECCENTRICITY_SQUARED = 0.00669437999014;

	// Get the radians
	const radLat = DegreesToRadians(pos.x);
	const radLon = DegreesToRadians(pos.y);
	const radBaseLat = DegreesToRadians(base.x);
	const radBaseLon = DegreesToRadians(base.y);

	// Do the calculations
	const distNorth = (EARTH_MAJOR_AXIS * (1 - EARTH_FIRST_ECCENTRICITY_SQUARED) / Math
		.pow(1 - EARTH_FIRST_ECCENTRICITY_SQUARED * Math.pow(Math.sin(radBaseLat), 2), 3.0 / 2))
		* (radLat - radBaseLat);

	const distEast = (EARTH_MAJOR_AXIS
		/ Math.sqrt(1 - EARTH_FIRST_ECCENTRICITY_SQUARED * Math.pow(Math.sin(radBaseLat), 2)))
		* Math.cos(radBaseLat) * (radLon - radBaseLon);

	// Return the result in meters
	return {
		x: distEast,
		y: distNorth
	};
}

/*
  *
  * @export
  * @method Converts a distance in feet to distance in meters
  *
  * @param {number} [feet] The value in feet to convert
  *
  * @return {number} Returns the value in meters
  * */
export const FeetToMeters = (feet: number): number => feet / 3.281;
