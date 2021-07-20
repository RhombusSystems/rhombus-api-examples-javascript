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
import { CameraPlot } from "../services/graph_service"
import { LeftOfLine } from "./utils/left_of_line"

/*
  *
  * @export
  * @interface Triangle
  *
  * A triangle is used during rasterization as a simple primitive. NOTE: The points p0, p1, and p2 must be set counter clockwise, otherwise linetests will be wrong.
  * */
export interface Triangle {
	/*
	  * @type {Vec2} The X Y position of vertex 0 in the triangle.
	  * @memberof Triangle
	  * */
	p0: Vec2;

	/*
	  * @type {Vec2} The X Y position of vertex 1 in the triangle.
	  * @memberof Triangle
	  * */
	p1: Vec2;

	/*
	  * @type {Vec2} The X Y position of vertex 2 in the triangle.
	  * @memberof Triangle
	  * */
	p2: Vec2;
};

/*
  *
  * @export
  * @method Converts a CameraPlot (which creates a triangle with 3 vertices) into a Triangle interface which the rasterizer can use.
  *
  * @param {CameraPlot} [camera] The CameraPlot to be transformed into a rasterizable triangle.
  * @param {number} [offset] Because the coordinate space of the CameraPlot has the origin camera as (0, 0), the offset is used to convert the vertices in this coordinate space 
  * to screenspace where (0, 0) is the top left of the screen.
  *
  * @return {Triangle} Returns the triangle that the CameraPlot was transformed into.
  * */
export const TriangleFromCameraPlot = (camera: CameraPlot, offset: number): Triangle => {
	return {
		p0: { x: camera.x[0] + offset, y: camera.y[0] + offset },
		p1: { x: camera.x[1] + offset, y: camera.y[1] + offset },
		p2: { x: camera.x[2] + offset, y: camera.y[2] + offset },
	};
}

/*
  *
  * @export
  * @method Tests whether a X Y position is inside of a triangle or not
  *
  * @param {Triangle} [triangle] The triangle to test the point inside.
  * @param {Vec2} [point] The point we are testing.
  *
  * @return {boolean} Returns true if the point is inside of the triangle.
  * */
export const PointInsideTriangle = (triangle: Triangle, point: Vec2): boolean => {
	// We know that the triangle's points are going counter clockwise, so we are just going to test that `point` is to the left of each of the lines and if it is then we know `point` is inside of `triangle`.
	const l1 = LeftOfLine(triangle.p0, triangle.p1, point);
	const l2 = LeftOfLine(triangle.p1, triangle.p2, point);
	const l3 = LeftOfLine(triangle.p2, triangle.p0, point);
	return l1 && l2 && l3;
}

