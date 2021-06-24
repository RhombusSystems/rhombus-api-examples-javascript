export const DegreesToRadians = (degrees: number): number => {
	return degrees * Math.PI / 180;
}

export const NormalizeAngle = (radians: number): number => {
	while (radians < 0) {
		radians += 2 * Math.PI;
	}

	while (radians > 2 * Math.PI) {
		radians -= 2 * Math.PI;
	}
	return radians;
}

export const ConvertRhombusAngle = (radians: number): number => {
	// Rhombus Unit circle is going clockwise, we want it to go counter clockwise
	radians = -radians;
	radians += 5 * Math.PI / 2;
	return NormalizeAngle(radians);
}
