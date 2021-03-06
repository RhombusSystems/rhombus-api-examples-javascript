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
  * @import Import necessary Rhombus APIs
  * */
import { CameraWebserviceApi, ActivityEnum, FootageBoundingBoxType, FootageSeekPointV2Type, Configuration } from "@rhombus/API"
import { RHOMBUS_HEADERS } from "../utils/headers"

/*
  *
  * @export
  * @method Send all found bounding boxes to Rhombus to be created on the console
  *
  * @param {Configuration} [config] The configuration with our API key
  * @param {string} [cameraUUID] The UUID of the camera we want to create bounding boxes for
  * @param {FootageBoundingBoxType[]} [boundingBoxes] The bounding boxes to add to the console
  *
  * */
export const RhombusFinalizer = async (config: Configuration, cameraUUID: string, boundingBoxes: FootageBoundingBoxType[]) => {
	// If there were no created boxes, then we should return early
	if (boundingBoxes.length == 0) {
		console.log("Detected no objects! Returning early...");
		return;
	}

	// Create the camera API with our configuration
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(config);

	// Send Rhombus our boundingBoxes, we actually don't have to do anything here since all the data has already been formatted properly
	let response = await api.createFootageBoundingBoxes(
		{
			cameraUuid: cameraUUID,
			footageBoundingBoxes: boundingBoxes,
		},
		// NOTE: It is necessary to use the RHOMBUS_HEADERS otherwise you will receive a 401 Unauthorized error
		RHOMBUS_HEADERS
	);

	// Debug info
	console.log("Rhombus responded with ");
	console.log(response);

	console.log("Creating footage seekpoints...");

	// We also are going to create some seekpoints, so we will create an empty array which will be filled according to our boundingBoxes data
	let seekpoints: FootageSeekPointV2Type[] = [];

	// Add new seekpoints for all of our bounding boxes with the timestamp of those boxes
	boundingBoxes.forEach(box => {
		seekpoints.push({
			a: ActivityEnum.CUSTOM,
			ts: box.ts,
			cdn: box.cdn,

		});
	});


	// Create all of our seekpoints
	response = await api.createFootageSeekpoints(
		{
			cameraUuid: cameraUUID,
			footageSeekPoints: seekpoints,
		},
		// NOTE: It is necessary to use the RHOMBUS_HEADERS otherwise you will receive a 401 Unauthorized error
		RHOMBUS_HEADERS
	);

	// Debug info
	console.log("Rhombus responded with ");
	console.log(response);
}
