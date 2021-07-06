import { HumanEvent } from "../types/human_event"
import { divide, subtract, Vec2 } from "../types/vector"

/*
  *
  * @export 
  * @method Returns the X and Y velocity of a bounding box of a human event in permyriad / milisecond
  *
  * @param {HumanEvent} [a] The first human event
  * @param {HumanEvent} [b] The following human event
  *
  * @return {Vec2} Returns a velocity in permyriad / milisecond between human event `a` and human event `b`
  * */
export const GetVelocity = (a: HumanEvent, b: HumanEvent): Vec2 => {
	// Velocity = (a.position - b.position) / (a.timestamp / b.timestamp)
	return divide(subtract(b.position, a.position), (b.timestamp - a.timestamp));
}

/*
  *
  * @export 
  * @method Normalizes a velocity so that its components are either -1, 0, or 1 and nothing in between
  *
  * @param {Vec2} [a] The velocity to normalize
  * @param {Vec2} [threshold] The threshold at which a velocity can be considered moving. This is a positive vector.
  * If the X threshold is 0.05 / 1000, an object will only be considered moving right if it has a velocity in the x direction that is greater than that.
  *
  * @return {Vec2} Returns a velocity, where the x and y values are either -1, 0, or 1, and nothing in between. 
  * If it is moving right, it's velocity will be 1 in on the x axis. 
  * If it is moving up, it's velocity will be -1 on the y axis
  * */
export const NormalizeVelocity = (a: Vec2, threshold: Vec2 = { x: 0, y: 0 }): Vec2 => {
	// If the velocity does not pass the threshold, it will be a 0 in that axis
	let normalizedVelocity: Vec2 = { x: 0, y: 0 };

	if (a.x > threshold.x) {
		// If the x velocity is greater than the threshold, we will give the x axis a 1
		normalizedVelocity.x = 1;

	} else if (a.x < -threshold.x) {
		// If the x velocity is less than the NEGATIVE threshold, we will give the x axis a -1
		normalizedVelocity.x = -1;
	}

	if (a.y > threshold.y) {
		// If the y velocity is greater than the threshold, we will give the y axis a 1
		normalizedVelocity.y = 1;
	} else if (a.y < -threshold.y) {
		// If the y velocity is less than the NEGATIVE threshold, we will give the y axis a -1
		normalizedVelocity.y = -1;
	}

	// Return the normalized vector
	return normalizedVelocity;
}

/*
  *
  * @export 
  * @method Normalizes a position so that its components are either -1, 0, or 1 and nothing in between
  *
  * @param {Vec2} [a] The position to normalize
  * @param {Vec2} [threshold] The threshold at which a position can be considered non 0
  * If the X threshold is 0.05, an object will only be considered on the right if it has a postion in the x direction that is greater than that.
  *
  * @return {Vec2} Returns a velocity, where the x and y values are either -1, 0, or 1, and nothing in between. 
  * If it is on the right, it's position will be 1 in on the x axis. 
  * If it is on the top, it's position will be -1 on the y axis
  * */
export const NormalizePosition = (a: Vec2, threshold: Vec2): Vec2 => {
	// If the position does not pass the threshold, it will be a 0 in that axis
	let normalizedPosition: Vec2 = { x: 0, y: 0 };

	if (a.x > 1 - threshold.x) {
		// If the x position is greater than 1 - threshold, we will give the x axis a 1
		normalizedPosition.x = 1;
	} else if (a.x < threshold.x) {
		// If the x position is less than the threshold, we will give the x axis a -1
		normalizedPosition.x = -1;
	}

	if (a.y > 1 - threshold.y) {
		// If the y position is less than the 1 - threshold, we will give the y axis a -1
		normalizedPosition.y = -1;
	} else if (a.y < threshold.y) {
		// If the y position is less than the threshold, we will give the y axis a 1
		normalizedPosition.y = 1;
	}

	// Return the normalized vector
	return normalizedPosition;
}
