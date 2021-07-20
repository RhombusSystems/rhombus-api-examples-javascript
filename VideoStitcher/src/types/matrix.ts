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

/*
  *
  * @export
  * @interface Mat2
  * 
  * This is a 2x2 matrix
  * */
export interface Mat2 {
	/*
	  * @type {[number, number, number, number]} The tuple of 4 numbers which are the elements of the matrix
	  * @memberof Mat2
	  * */
	values: [number, number, number, number];
};

/*
  *
  * @export
  * @method Applies a transformation to a vector: (Mat2) * (Vec2)
  *
  * @param {Mat2} [matrix] The transformation to be applied
  * @param {Vec2} [vec] The vector which the transformation will be applied to
  *
  * @return {Vec2} Returns the resulting vector after the transformation
  * */
export function Apply(matrix: Mat2, vec: Vec2): Vec2 {
	return {
		x: vec.x * matrix.values[0] + vec.y * matrix.values[1],
		y: vec.x * matrix.values[2] + vec.y * matrix.values[3],
	};
}

/*
  *
  * @export
  * @method Creates a 2x2 rotation matrix
  *
  * @param {number} [theta] The rotation this matrix will rotate by
  *
  * @return {Mat2} Returns the resulting 2x2 rotation matrix
  * */
export const Rotate = (theta: number): Mat2 => {
	return {
		values: [Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta)],
	};
}
