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

import { RHOMBUS_HEADERS } from "../utils/headers"

import { Configuration, CameraWebserviceApi } from "@rhombus/API"
import { Camera } from "../types/camera";
import { DegreesToRadians, ConvertRhombusAngle } from "../utils/math"
import { GetCameraSpecs } from "../utils/rhombus_camera_info"

/*
  *
  * @export
  * @method Gets the list of Rhombus Systems Cameras
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  *
  * @return {Promise<Camera[]>} Returns the list of cameras
  * */
export const GetCameraList = async (configuration: Configuration): Promise<Camera[]> => {
	// Create the api
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);

	// Send the request to Rhombus to get the camera state list
	const res = await api.getMinimalCameraStateList({}, RHOMBUS_HEADERS);
	res.cameraStates = res.cameraStates.filter(element => element.latitude != undefined && element.longitude != undefined && element.directionRadians);


	// Return the result but mapped to our own camera interface
	return res.cameraStates.map(camera => <Camera>{
		uuid: camera.uuid,
		// We will want to convert the Rhombus radians angle to our own coordinate space
		rotationRadians: ConvertRhombusAngle(camera.directionRadians),
		location: { x: camera.latitude, y: camera.longitude },
		FOV: DegreesToRadians(GetCameraSpecs(camera.hwVariation).FOV),
		viewDistance: GetCameraSpecs(camera.hwVariation).viewDistance,
	});
}
