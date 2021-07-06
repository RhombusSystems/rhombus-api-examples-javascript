/*
  *
  * @export
  * @method Converts degrees to radians
  *
  * @param {number} [degrees] The angle in degrees
  *
  * @return {number} Returns the radians result
  * */
export const DegreesToRadians = (degrees: number): number => {
	return degrees * Math.PI / 180;
}

/*
  *
  * @export
  * @method Isolates any radians angle to a radians angle between 0 and 2 PI
  *
  * @param {number} [radians] The angle in radians
  *
  * @return {number} Returns the same angle in radians, but ensures that it is between 0 and 2 PI
  * */
export const NormalizeAngle = (radians: number): number => {
	// While the radians is less than 0, we want to continually add 2 PI to it so that it will be within 0 and 2 PI
	while (radians < 0) {
		radians += 2 * Math.PI;
	}

	// While the radians is greater than 2 PI, we want to continually subtract 2 PI to it so that it will be within 0 and 2 PI
	while (radians > 2 * Math.PI) {
		radians -= 2 * Math.PI;
	}
	return radians;
}

/*
  *
  * @export
  * @method Converts the Rhombus radians angle to our own coordinate space. 
  * The Rhombus API gives a rotation in radians, that increases clockwise and has 0 pointing North. 
  * We want to convert these angles to an angle where 0 is East, and it is rotating counter clockwise
  *
  * @param {number} [radians] The angle in radians that Rhombus gives
  *
  * @return {number} Returns the an equivalent angle in radians in our own coordinate space which is more similar to unit circle
  * */
export const ConvertRhombusAngle = (radians: number): number => {
	// Rhombus Unit circle is going clockwise, we want it to go counter clockwise
	radians = -radians;
	radians += 5 * Math.PI / 2;
	return NormalizeAngle(radians);
}
