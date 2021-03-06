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

/*
  *
  * @export
  * @interface Vec2
  * */
export interface Vec2 {
	/*
	  * @type {number} X value of this vector
	  * @memberof Vec2
	  * */
	x: number;

	/*
	  * @type {number} Y value of this vector
	  * @memberof Vec2
	  * */
	y: number;

};

/*
  *
  * @export
  * @method Add two vectors together
  *
  * @param {Vec2} [a] The first vector
  * @param {Vec2} [b] The second vector
  *
  * @return {Vec2} Returns the resulting vector [a.x + b.x, a.y + b.y]
  * */
export const add = (a: Vec2, b: Vec2): Vec2 => {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
	};
}

/*
  *
  * @export
  * @method Subtracts vector b from vector a
  *
  * @param {Vec2} [a] The vector to be subtracted from
  * @param {Vec2} [b] The vector which will be subtracted from a
  *
  * @return {Vec2} Returns the resulting vector [a.x - b.x, a.y - b.y] 
  * */
export const subtract = (a: Vec2, b: Vec2): Vec2 => {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
	};
}

/*
  *
  * @export
  * @method Gets the dot product of two vectors
  *
  * @param {Vec2} [a] The first vector
  * @param {Vec2} [b] The second vector
  *
  * @return {Vec2} Returns the dot product of vector a and vector b
  * */
export const dot = (a: Vec2, b: Vec2): number => {
	return a.x * b.x + a.y * b.y;
}

/*
  *
  * @export
  * @method Gets the absolute value of vector a
  *
  * @param {Vec2} [a] The vector
  *
  * @return {Vec2} Returns the resulting vector [abs(a.x), abs(a.y)]
  * */
export const abs = (a: Vec2): Vec2 => {
	return {
		x: Math.abs(a.x),
		y: Math.abs(a.y),
	};
}

/*
  *
  * @export
  * @method Gets the length of a vector
  *
  * @param {Vec2} [a] The vector
  *
  * @return {Vec2} Returns the length of the vector
  * */
export const len = (a: Vec2): number => {
	// Just the distance formula	
	return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
}

/*
  *
  * @export
  * @method Compares the length of vector a with either the length of vector b or a scalar
  *
  * @param {Vec2} [a] The first vector
  * @param {Vec2 | number} [b] The second vector or a scalar
  *
  * @return {number} Returns -1 if the length of a is greater than b, 1 if b is greater than a, and 0 if they are equal
  * */
export function compare(a: Vec2, b: number): number;
export function compare(a: Vec2, b: Vec2): number;
export function compare(a: Vec2, b: any): number {
	// b is a scalar
	if (b.x == undefined) {
		if (len(a) > b) return -1;
		if (len(a) < b) return 1;
		return 0;

		// b is a vector
	} else {
		if (len(a) > len(b)) return -1;
		if (len(a) < len(b)) return 1;
		return 0;
	}
}

/*
  *
  * @export
  * @method Divides a vector by a scalar
  *
  * @param {Vec2} [a] The vector to be divided
  * @param {number} [b] The number to divide the vector
  *
  * @return {Vec2} Returns the resulting vector [a.x / b, a.y / b]
  * */
export function divide(a: Vec2, b: number): Vec2 {
	return {
		x: a.x / b,
		y: a.y / b,
	};
}
