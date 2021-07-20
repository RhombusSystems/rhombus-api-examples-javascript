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

import { Vec2 } from "../types/vector"
import { Apply, Rotate } from "../types/matrix"
import { LeftOfLine } from "./utils/left_of_line"

/*
  *
  * @export
  * @interface CaptureNetTrapezoid
  *
  * Primitive trapezoid which is used to project a velocity to see which camera's FOV's intersect. NOTE: The points p0, p1, p2, and p3 must be set counter clockwise, otherwise linetests will be wrong.
  * */
export interface CaptureNetTrapezoid {
	/*
	  * @type {Vec2} The X Y position of vertex 0 in the triangle.
	  * @memberof CaptureNetTrapezoid
	  * */
	p0: Vec2;

	/*
	  * @type {Vec2} The X Y position of vertex 1 in the triangle.
	  * @memberof CaptureNetTrapezoid
	  * */
	p1: Vec2;

	/*
	  * @type {Vec2} The X Y position of vertex 2 in the triangle.
	  * @memberof CaptureNetTrapezoid
	  * */
	p2: Vec2;

	/*
	  * @type {Vec2} The X Y position of vertex 3 in the triangle.
	  * @memberof CaptureNetTrapezoid
	  * */
	p3: Vec2;
};

/*
  *
  * @export
  * @method Creates a capture net based on a specified radius and meterSpan. This trapezoid will not be transformed properly into worldspace, but it will be a basic primitive that will later be rotated properly.
  *
  * @param {number} [captureRadius] The capture radius specifies the size in meters of the large side of the trapezoid (pointing out from the center).
  * The larger this value, the more cameras will be "captured" within this "net"
  * @param {number} [meterSpan] The canvas size in meters of all of the cameras.
  * This is used because this will be the length of the capture net so that even cameras on the very edge of the screen can still be caught.
  *
  * @return {CaptureNetTrapezoid} A trapezoid with the specified capture Radius and meter span pointing left from the origin that hasn't been rotated or transformed.
  * */
export const NewCaptureNet = (captureRadius: number, meterSpan: number): CaptureNetTrapezoid => {
	return {
		p0: { x: meterSpan, y: -0.5 - (captureRadius - 1) / 2 },
		p1: { x: meterSpan, y: 0.5 + (captureRadius - 1) / 2 },
		p2: { x: 0, y: 0.5 },
		p3: { x: 0, y: -0.5 },
	};
}

/*
  *
  * @export
  * @method Translates a capture net by a specified offset.
  *
  * @param {CaptureNetTrapezoid} [captureNet] The capture net to translate.
  * @param {number} [offset] The amount in meters to translate the capture net. This is just a number instead of a Vec2 since we are only dealing with squares.
  *
  * @return {CaptureNetTrapezoid} The resulting capture net after the transformation.
  * */
export const OffsetCaptureNet = (captureNet: CaptureNetTrapezoid, offset: number): CaptureNetTrapezoid => {
	return {
		p0: { x: captureNet.p0.x + offset, y: captureNet.p0.y + offset },
		p1: { x: captureNet.p1.x + offset, y: captureNet.p1.y + offset },
		p2: { x: captureNet.p2.x + offset, y: captureNet.p2.y + offset },
		p3: { x: captureNet.p3.x + offset, y: captureNet.p3.y + offset },
	};
}

/*
  *
  * @export
  * @method Rotates a capture net using a normalized velocity.
  * Since there is no good way to know the exact direction someone may have walked of screen, we use general angles using a normalized velocity to see where the use _probably_ walked off.
  *
  * @param {CaptureNetTrapezoid} [captureNet] The capture net to translate.
  * @param {Vec2} [velocity] The NORMALIZED velocity of the human. The HAS to be normalized, otherwise this method won't work.
  *
  * @return {CaptureNetTrapezoid} The resulting capture net after the rotation.
  * */
export const RotateCaptureNetFromVelocity = (captureNet: CaptureNetTrapezoid, velocity: Vec2): CaptureNetTrapezoid => {
	// The rotation we need to rotate the capture net by in radians.
	let rotation = 0;

	// If the velocity is 0, then we can't do anything and there shouldn't be an exit event at all.
	// 
	// The normalized velocity on the X axis has a value of 1 be right on the unit circle, and -1 be left.
	// The normalized velocity on the Y axis has a value of 1 be bottom on the unit circle, and -1 be top.
	if (velocity.x == 0 && velocity.y == 0) {
		throw ("No velocity!");
	} else if (velocity.x == 1 && velocity.y == 0) {
		return captureNet;
	} else if (velocity.x == 1 && velocity.y == 1) {
		rotation = -Math.PI / 4;
	} else if (velocity.x == 1 && velocity.y == -1) {
		rotation = Math.PI / 4;
	} else if (velocity.x == -1 && velocity.y == 0) {
		rotation = Math.PI;
	} else if (velocity.x == -1 && velocity.y == 1) {
		rotation = -3 * Math.PI / 4;
	} else if (velocity.x == -1 && velocity.y == -1) {
		rotation = -5 * Math.PI / 4;
	} else if (velocity.x == 0 && velocity.y == 1) {
		rotation = -Math.PI / 2;
	} else if (velocity.x == 0 && velocity.y == -1) {
		rotation = Math.PI / 2;
	} else {
		throw ("Please make sure that you are using a normalized velocity!");
	}

	// We are going to create a 2x2 rotation matrix using our `rotation`.
	const rotationMatrix = Rotate(rotation);

	// And then rotate all of the capture net's vertices.
	const p0 = Apply(rotationMatrix, captureNet.p0);
	const p1 = Apply(rotationMatrix, captureNet.p1);
	const p2 = Apply(rotationMatrix, captureNet.p2);
	const p3 = Apply(rotationMatrix, captureNet.p3);

	// Then return the new trapezoid
	return {
		p0: p0,
		p1: p1,
		p2: p2,
		p3: p3,
	};
}

/*
  *
  * @export
  * @method Tests whether a X Y position is inside of a triangle or not
  *
  * @param {CaptureNetTrapezoid} [trapezoid] The trapezoid to test the point inside.
  * @param {Vec2} [point] The point we are testing.
  *
  * @return {CaptureNetTrapezoid} The resulting capture net after the transformation.
  * */
export const PointInsideTrapezoid = (trapezoid: CaptureNetTrapezoid, point: Vec2): boolean => {
	// We know that the trapezoid's points are going counter clockwise, so we are just going to test that `point` is to the left of each of the lines and if it is then we know `point` is inside of `trapezoid`.
	const l1 = LeftOfLine(trapezoid.p0, trapezoid.p1, point);
	const l2 = LeftOfLine(trapezoid.p1, trapezoid.p2, point);
	const l3 = LeftOfLine(trapezoid.p2, trapezoid.p3, point);
	const l4 = LeftOfLine(trapezoid.p3, trapezoid.p0, point);
	return l1 && l2 && l3 && l4;
}
