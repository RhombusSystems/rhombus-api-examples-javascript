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
import { GetCameraPlot, CameraPlot } from "../services/graph_service"
import { Camera } from "../types/camera"
import { TriangleFromCameraPlot, PointInsideTriangle } from "./triangle"
import { ExitEvent } from "../types/events"
import { NormalizeVelocity } from "../utils/velocity"
import { GetCanvasSize } from "./canvas_size"
import { NewCaptureNet, OffsetCaptureNet, PointInsideTrapezoid, RotateCaptureNetFromVelocity } from "./trapezoid"

/*
  *
  * @export
  * @interface Vec2
  *
  * A pixel is basically just an array of camera UUIDs which intersect with a pixel when rasterized. 
  * */
export interface Pixel {
	/*
	  * @type {string[]} The array of camera UUIDs which intersect with this pixel when rasterized.
	  * We store an array of camera UUIDs because we need to basically "alpha blend" the different cameras, to make sure that when camera's FOV's intersect, they will not be overwritten when rasterizing.
	  * This is why we can't store booleans, because we wouldn't have the necessary info of which cameras are where and values would get overwritten.
	  *
	  * @memberof Pixel
	  * */
	cameras: string[];
};

/*
  *
  * @export
  * @interface Screen
  *
  * A screen is the result of rasterizing a list of cameras. It stores a 2D array of pixels so we know where each of the camera's viewports can see.
  * */
export interface Screen {
	/*
	  * @type {Pixel[][]} 2D array of pixels which for this screen.
	  * @memberof Screen
	  * */
	pixels: Pixel[][];

	/*
	  * @type {number} The canvas size in meters of all of the cameras.
	  * @memberof Screen
	  * */
	meterSpan: number;

	/*
	  * @type {number} The size in pixels of the square. This is determined from the `meterSpan` and the `pixelSize`.
	  * @memberof Screen
	  * */
	screenSize: number;

	/*
	  * @type {number} The size in meters of each of the pixels. This will be determined from the provided pixelsPerMeter value. If the pixelsPerMeter value is 10, then `pixelSize` is 1/10 of a meter.
	  * @memberof Screen
	  * */
	pixelSize: number;

	/*
	  * @type {number} The offset in meters that each of the camera's positions are. The Screen has an origin of the top left as (0, 0), whereas previously the origin was the originCamera.
	  * So in order to convert the camera space to screen space we need to offset all of the cameras by some amount in meters.
	  *
	  * @memberof Screen
	  * */
	offset: number;
};

/*
  *
  * @export
  * @interface CaptureNetScreen
  *
  * This is a screen just for the capture net trapezoid which is a projection of a velocity. This is used to see which cameras are most likely to catch the person walking into the camera.
  * */
export interface CaptureNetScreen {
	/*
	  * @type {boolean[][]} In the capture net screen, we only need booleans instead of pixels since we are just checking whether a pixel is inside the capture net or not when rasterizing,
	  * there is no "alpha blending" in computer graphics terms.
	  * @memberof CaptureNetScreen
	  * */
	pixels: boolean[][];

	/*
	  * @type {number} The canvas size in meters of all of the cameras.
	  * @memberof CaptureNetScreen
	  * */
	meterSpan: number;

	/*
	  * @type {number} The size in pixels of the square. This is determined from the `meterSpan` and the `pixelSize`.
	  * @memberof CaptureNetScreen
	  * */
	screenSize: number;

	/*
	  * @type {number} The size in meters of each of the pixels. This will be determined from the provided pixelsPerMeter value. If the pixelsPerMeter value is 10, then `pixelSize` is 1/10 of a meter.
	  * @memberof CaptureNetScreen
	  * */
	pixelSize: number;
};

/*
  *
  * @export
  * @method Rasterizes an array of camera plots into a screen.
  *
  * @param {CameraPlot[]} [cameras] The array of camera plots to rasterize
  * @param {number} [pixelsPerMeter] The number of pixels that should be rendered for each meter. This is essentially the density of pixels.
  * @param {number} [meterSpan] The size in meters of the canvas.
  *
  * @return {Screen} Returns the rasterized screen.
  * */
export const RasterizeCameras = (cameras: CameraPlot[], pixelsPerMeter: number, meterSpan: number): Screen => {
	// Get the screen size in pixels.
	const screenSize = Math.ceil(pixelsPerMeter * meterSpan);

	// Get the pixel size in meters.
	const pixelSize = 1 / pixelsPerMeter;

	// Get the offset by dividing the meter span by 2. This converts the origin (the center of the cameras) to the screen space origin (the top left of the screen).
	const offset = meterSpan / 2;

	// Create our array of pixels.
	let pixels: Pixel[][] = [];

	// Loop through each of the cameras to rasterize each of them.
	for (const camera of cameras) {
		// We are going to create a triangle for the camera.
		const triangle = TriangleFromCameraPlot(camera, offset);

		// Loop through each of the pixels.
		for (let row = 0; row < screenSize; row++) {
			for (let column = 0; column < screenSize; column++) {
				// If the pixel row hasn't been initialized yet, then we will do that here.
				if (pixels[row] == undefined) {
					pixels[row] = [];

					// And we're just going to push empty pixels to this new array.
					for (let i = 0; i < screenSize; i++) {
						pixels[row].push({ cameras: [] });
					}
				}

				// Next we are going to get the position of this pixel in world space.
				// We will simply multiply the x and y screen position by the pixel size in meters to get the position in world space.
				const position: Vec2 = {
					x: column * pixelSize,
					y: row * pixelSize,
				};

				// Now we will test whether the pixel is inside the triangle.
				const inside = PointInsideTriangle(triangle, position);

				// If it is inside...
				if (inside) {
					// Then we will add whatever camera we are rendering to the pixel.
					pixels[row][column].cameras.push(camera.uuid);
				}
			}
		}
	}

	// Now we will return our rendered screen.
	return {
		pixels: pixels,
		meterSpan: meterSpan,
		pixelSize: pixelSize,
		screenSize: screenSize,
		offset: offset,
	};

}


/*
  *
  * @export
  * @interface RasterizeVelocityResult
  * */
export interface RasterizeVelocityResult {

	/*
	  * @type {CaptureNetScreen} The screen after rasterizing the velocity
	  * @memberof RasterizeVelocityResult 
	  * */
	netScreen: CaptureNetScreen;

	/*
	  * @type {Set<string>} The set of camera UUIDs that were caught by the capture net.
	  * @memberof RasterizeVelocityResult 
	  * */
	cameras: Set<string>;
};

/*
  *
  * @export
  * @method Rasterizes a velocity capture net and determines which cameras were caught by this capture net.
  *
  * @param {ExitEvent} [exitEvent] The exit event to rasterize the velocity of.
  * @param {number} [captureRadius] The capture radius of the net in meters.
  * @param {Screen} [screen] The screen from rasterized cameras.
  *
  * @return {RasterizeVelocityResult} Returns the rasterized velocity screen for debugging purposes and a set of cameras.
  * */
export const RasterizeVelocity = (exitEvent: ExitEvent, captureRadius: number, screen: Screen): RasterizeVelocityResult => {
	// We are going to normalize the velocity of the exit event to prepare for rasterization.
	const velocity = NormalizeVelocity(exitEvent.velocity);

	// Create the capture net.
	const captureNet = NewCaptureNet(captureRadius, screen.meterSpan);

	// Rotate the capture net from the normalized velocity.
	const rotatedCaptureNet = RotateCaptureNetFromVelocity(captureNet, velocity);

	// Then translate the capture net by the screen offset in meters to transform the world space to screen space.
	const net = OffsetCaptureNet(rotatedCaptureNet, screen.offset);

	// Create our set of valid camera UUIDs
	let validCameras = new Set<string>();

	// Create the array of pixels for our capture net rasterization. We only need booleans for this since we are only really rasterizing one trapezoid and as such there is no "alpha blending".
	let pixels: boolean[][] = [];

	// Loop through all fo the screen pixels
	for (let row = 0; row < screen.screenSize; row++) {
		for (let column = 0; column < screen.screenSize; column++) {
			// If the pixel row hasn't been initialized yet, then we will do that here.
			if (pixels[row] == undefined) {
				pixels[row] = [];

				// And we're just going to push false pixels to this new array.
				for (let i = 0; i < screen.screenSize; i++) {
					pixels[row].push(false);
				}
			}

			// Next we are going to get the position of this pixel in world space.
			// We will simply multiply the x and y screen position by the pixel size in meters to get the position in world space.
			const position: Vec2 = {
				x: column * screen.pixelSize,
				y: row * screen.pixelSize,
			};

			// Now we will test whether the pixel is inside the triangle.
			const inside = PointInsideTrapezoid(net, position);

			// If it is inside...
			if (inside) {
				// Then we will set the pixel to true.
				pixels[row][column] = inside;

				// And then add whatever cameras there are in the `screen` to our set of `validCameras`.
				screen.pixels[row][column].cameras.forEach(cam => validCameras.add(cam));
			}
		}
	}

	// Then return our screen and valid cameras.
	return {
		netScreen: {
			pixels: pixels,
			meterSpan: screen.meterSpan,
			screenSize: screen.screenSize,
			pixelSize: screen.pixelSize,
		},
		cameras: validCameras
	};
}

/*
  *
  * @export
  * @method Gets a list of valid cameras based on an exit event's velocity and the location of the cameras.
  *
  * @param {Camera[]} [cameras] The list of cameras that exist.
  * @param {ExitEvent} [exitEvent] The exit event to look for cameras for.
  * @param {number} [pixelsPerMeter] The number of pixels that should be rendered for each meter. This is essentially the density of pixels.
  * @param {number} [captureRadius] The capture radius of the net in meters.
  *
  * @return {Camera[]} Returns an array of valid cameras based on location of the cameras and the velocity of the exit event.
  * */
export const GetValidCameras = (cameras: Camera[], exitEvent: ExitEvent, pixelsPerMeter: number, captureRadius: number): Camera[] => {
	// Get the camera attached to the exit event
	const origin = exitEvent.events[0].camera;

	// Only include cameras that don't match the origin UUID, since we will never "switch" to the same camera UUID.
	cameras = cameras.filter(cam => cam.uuid != origin.uuid);

	// Next we will get the canvas size in meters.
	const canvasSize = GetCanvasSize(cameras, origin);

	// And then plot all of the cameras we need.
	const cameraPlots = cameras.map(cam => GetCameraPlot(cam, origin));

	// Then we will rasterize the cameras.
	const cameraScreen = RasterizeCameras(cameraPlots, pixelsPerMeter, canvasSize.x);

	// And the velocity.
	const res = RasterizeVelocity(exitEvent, captureRadius, cameraScreen);

	// Create our array of valid cameras.
	let validCameras: Camera[] = [];

	// Loop through our resulting set of UUIDs and convert it to an array of cameras.
	res.cameras.forEach(cam => {
		validCameras.push(cameras.find(_cam => _cam.uuid == cam));
	});

	// Return our cameras.
	return validCameras;
}

