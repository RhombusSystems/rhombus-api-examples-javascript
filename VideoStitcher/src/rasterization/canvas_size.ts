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

import { Camera } from "../types/camera"
import { Vec2 } from "../types/vector"
import { GetCameraPlot } from "../services/graph_service"

/*
  *
  * @export
  * @method Gets the size in meters of a canvas for a list of cameras. This method basically gives the smallest box in meters that encloses all of the cameras and their FOVs.
  *
  * @param {Camera[]} [cameras] The list of cameras to put a box around.
  * @param {Camera} [originCamera] The camera that should be at the center of the box and facing up. This method will get a camera plot and then based on that plot put a box around all of them.
  *
  * @return {Vec2} Returns the dimensions in meters of the box.
  * */
export const GetCanvasSize = (cameras: Camera[], originCamera: Camera): Vec2 => {
	// We are going to store 2 values, the maximum distance X and the maximum distance Y from the `originCamera`
	let extremeX = 0;
	let extremeY = 0;

	// Loop through all of the cameras
	for (const camera of cameras) {
		// If there is no rotation (if it's not on the map) then we can't do anything
		if (isNaN(camera.rotationRadians)) continue;

		// Get the camera plot so we know where all of the "vertices" of the camera are
		const plot = GetCameraPlot(camera, originCamera);

		// Loop through all of the x values of the vertices
		for (const x of plot.x) {

			// If the absolute value of X is greater than the `extremeX`, that means this x value should be the new extreme.
			// We are doing absolute value here because we do not care if this X value is positive or negative, just its distance from the originCamera which we consider as (0, 0)
			if (Math.abs(x) > Math.abs(extremeX)) {

				// Update the extreme value
				extremeX = x;
			}

		}

		// Loop through all of the y values of the vertices
		for (const y of plot.y) {

			// If the absolute value of Y is greater than the `extremeY`, that means this y value should be the new extreme.
			// We are doing absolute value here because we do not care if this Y value is positive or negative, just its distance from the originCamera which we consider as (0, 0)
			if (Math.abs(y) > Math.abs(extremeY)) {

				// Update the extreme value
				extremeY = y;
			}
		}
	}

	// The width of the box will be the extremeX value multiplied by 2 (since the extreme values are basically just the distance of one side from the center of the square).
	const width = Math.abs(extremeX) * 2;
	const height = Math.abs(extremeY) * 2;

	// We will just create a square with either both the width or both of the height values. We will figure out which one is greater and use that for our Vec2. 
	if (width >= height) {
		return {
			x: width,
			y: width,
		};
	} else {
		return {
			x: height,
			y: height,
		};
	}
}
