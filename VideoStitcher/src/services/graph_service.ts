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

import { ExitEvent, FinalizedEvent } from "../types/events"
import { Camera } from "../types/camera"
import { IOServer } from "../server/server"
import { Vec2 } from "../types/vector"
import { GeodeticToENUSimpleApproximation } from "../utils/utils"
import { Rotate, Apply } from "../types/matrix"
import { NormalizeAngle } from "../utils/math"
import { GetCanvasSize } from "../rasterization/canvas_size"
import { RasterizeCameras, RasterizeVelocity } from "../rasterization/rasterizer"
import { Environment } from "../environment/environment"

/*
  *
  * @export
  * @interface PlotGraphMessage
  *
  * Sent over the Socket.IO connection to the dev tools to plot the position of a finalized event 
  * */
export interface PlotGraphMessage {
	/*
	  * @type {FinalizedEvent} The first event to plot. There may be subsequent chained events that are attached to this event
	  * @memberof PlotGraphMessage
	  * */
	event: FinalizedEvent;
};

/*
  *
  * @export
  * @interface CameraPlot
  *
  * The plot of a camera containing its vertices and other relevant information
  * */
export interface CameraPlot {
	/*
	  * @type {number[]} The array of x coordinates for the camera vertices
	  * @memberof CameraPlot
	  * */
	x: number[];

	/*
	  * @type {number[]} The array of y coordinates for the camera vertices
	  * @memberof CameraPlot
	  * */
	y: number[];

	/*
	  * @type {Vec2} The position of the camera in meters from the origin camera
	  * @memberof CameraPlot
	  * */
	position: Vec2;

	/*
	  * @type {number} The rotation of the camera in radians using our own coordinate space, where 0 is East and PI / 2 is North
	  * @memberof CameraPlot
	  * */
	rotation: number;

	/*
	  * @type {string} The UUID of the camera
	  * @memberof CameraPlot
	  * */
	uuid: string;
};

/*
  *
  * @export
  * @interface CameraPlot
  *
  * Sent over the Socket.IO connection to the dev tools to plot the position of the cameras
  * */
export interface PlotCamerasMessage {
	/*
	  * @type {CameraPlot[]} The array of camera plots to show in the devtools
	  * @memberof CameraPlot
	  * */
	cameras: CameraPlot[];
};


/*
  *
  * @export
  * @method Sends the plot graph message to the dev tools client
  *
  * @param {PlotGraphMessage} [msg] The message to send to the devtools
  * */
export const SendGraph = (msg: PlotGraphMessage): void => {
	// If there is no msg, then we shouldn't send anything to the devtools
	if (!msg) return;

	// Tell the socket IO server to send our message
	IOServer.Emit("Plot-Graph", msg);
}

/*
  *
  * @method Gets the length of the sides of the triangle FOV when rendering the triangle vertices
  *
  * @param {number} [angle] The angle of the camera in radians in our own coordinate space, where 0 is East and PI / 2 is North
  * @param {number} [cameraDistance] The distance that the camera can see on average in meters (this is not an exact measurement, this is just a general statement about how far the camera can see)
  *
  * @return {number} Returns the length of the side of the triangle FOV
  * */
const GetCameraSideRadius = (angle: number, cameraDistance: number): number => {
	return cameraDistance / Math.cos(angle);
}

/*
  *
  * @export
  * @method Gets a camera plot for a specific camera
  *
  * @param {Camera} [camera] The camera to get the camera plot for
  * @param {Camera} [origin] The origin camera which will be drawn at the center. This is necessary because all other camera's positions 
  * will be based on this camera and will be rotated so that the origin camera will be rotated upward.
  *
  * @return {CameraPlot} Returns the resulting camera plot of this camera
  * */
export const GetCameraPlot = (camera: Camera, origin: Camera): CameraPlot => {
	// Get the rotation of the camera in radians
	const rot = camera.rotationRadians;

	// Get the FOV fo the camera
	const fov = camera.FOV;

	// Get the side radius using our FOV and viewDistance so taht we can draw a triangle
	const cameraSideRadius = GetCameraSideRadius(fov / 2, camera.viewDistance);

	// Get the offset of the camera from the origin in meters
	const offset = GeodeticToENUSimpleApproximation(camera.location, origin.location);


	// This is how we want to render our triangle of the camera in local space
	// ###########
	//  ########
	//   ###### 
	//    ####  
	//     ##  

	// Get the X and Y positions of the camera vertices. 
	let positions: Vec2[] = [
		// The starting vertex in the local space will be the top left of the triangle. (refer to the image above)
		{
			x: cameraSideRadius * Math.cos(rot + fov / 2) + offset.x,
			y: cameraSideRadius * Math.sin(rot + fov / 2) + offset.y
		},
		// The second vertex in the local space will be bottom middle of the triangle. (refer to the image above)
		{
			x: offset.x,
			y: offset.y,
		},
		// The final vertex in the local space will be the top right of the triangle. (refer to the image above).
		{
			x: cameraSideRadius * Math.cos(rot - fov / 2) + offset.x,
			y: cameraSideRadius * Math.sin(rot - fov / 2) + offset.y,
		},
	]

	// We need to rotate the triangle above so that it lines up with the camera in the origin, which will be in the center and facing up.
	// The first step is to get the offset rotation in radians
	const offsetRotation = NormalizeAngle(Math.PI / 2 - origin.rotationRadians);

	// Then we will create a 2x2 rotation matrix from this offset rotation so we can rotate all of our vertices
	const rotation = Rotate(offsetRotation);

	// Then we will rotate all of our vertices by that rotation matrix
	positions = positions.map(pos => Apply(rotation, pos));

	// Then return the result as a camera plot
	return {
		x: positions.map((pos) => pos.x),
		y: positions.map((pos) => pos.y),
		uuid: camera.uuid,

		// We will add our offsetRotation so that the rotation of the camera is in world space
		rotation: offsetRotation + rot,
		position: positions[1],
	};
}

/*
  *
  * @export
  * @method Sends the camera plots to the client dev tools
  *
  * @param {Camera[]} [cameras] The array of cameras to render
  * @param {ExitEvent} [event] In order to render the cameras, there must be an exit event so that we can treat the camera in that exit event as the origin
  * */
export const SendCameraPlot = (cameras: Camera[], event: ExitEvent): void => {
	// If there is no exit event then there is no origin which means we cannot render
	if (!event) return;

	// Loop through all of the cameras so that we can find the matching camera to render
	cameras.forEach(cam => {

		// If the UUID of the camera matches the exit event camera
		if (cam.uuid == event.events[0].camera.uuid) {
			// Get all of the camera plots
			const plots = cameras.map(camera => GetCameraPlot(camera, cam));

			// Get the size of the canvas
			const canvasSize = GetCanvasSize(cameras, cam);

			// Rasterize the cameras (except the origin camera because we don't want to see it)
			const screen = RasterizeCameras(plots.filter(camera => camera.uuid != cam.uuid), 1, canvasSize.x);

			// Rasterize the velocity net
			const netScreen = RasterizeVelocity(event, Environment.CaptureRadiusMeters, screen);

			// Send the camera plot to the devtools
			IOServer.Emit("Plot-Cameras", {
				cameras: plots,
				screen: screen,
				netScreen: netScreen
			});
		}
	});
}
