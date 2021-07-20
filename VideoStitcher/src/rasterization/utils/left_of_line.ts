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

import { Vec2 } from "../../types/vector"


/*
  *
  * @export
  * @method Tests whether a point is to the left of a line. 
  * NOTE: Order of the points `a` and `b` matters. If you think of a line, the "left" changes based on where you start drawing the line. Keep this in mind when using this method. See the figure below!
  *
  * @param {Vec2} [a] The first point of the line (starting from the "bottom" of the line).
  * @param {Vec2} [b] The second point of the line (starting from the "bottom" of the line).
  * @param {Vec2} [c] The point to test
  *
  * @return {boolean} Returns point `c` is to the left of the line ab
  * */
export const LeftOfLine = (a: Vec2, b: Vec2, c: Vec2): boolean => {
	/*
	  *
	  *
	  *
	  *              2
	  *              |
	  *              |
	  *   LEFT       |
	  *              |
	  *              |
	  *              1
	  *
	  *
	  *
	  *              1
	  *              |
	  *              |
	  *              |       LEFT
	  *              |
	  *              |
	  *              2
	  *
	  * */
	return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
}
