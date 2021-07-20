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

import { Configuration, CameraWebserviceApi, FootageBoundingBoxType, ActivityEnum } from "@rhombus/API";
import { RHOMBUS_HEADERS } from "../utils/headers"

import { HumanEvent } from "../types/human_event"

import { CompareHumanEventsByTime } from "../types/events"

import { Vec2 } from "../types/vector"
import { Camera } from "../types/camera";


/*
  *
  * @export
  * @method Get human events from a camera
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  * @param {Camera} [camera] The camera to get the human events for
  * @param {number} [startTime] The start time in seconds to start getting human events
  * @param {number} [duration] The duration in seconds of time since the start time to look for events
  *
  * @return {Promise<Map<number, HumanEvent[]>>} Returns a map of object ID to HumanEvent array
  * */
export const GetHumanEvents = async (configuration: Configuration, camera: Camera, startTime: number, duration: number): Promise<Map<number, HumanEvent[]>> => {
	// Create the api
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);

	// Create a map of ID to bounding box to hold the result
	let ids = new Map<number, FootageBoundingBoxType[]>();

	// Send the request to Rhombus to get the bounding boxes
	const res = await api.getFootageBoundingBoxes(
		{
			cameraUuid: camera.uuid,
			startTime: startTime,
			duration: duration
		},
		RHOMBUS_HEADERS
	);

	// Filter the resulting bounding boxes so that we only get human events
	let rawEvents: FootageBoundingBoxType[] = res.footageBoundingBoxes.filter((event) => event.a == ActivityEnum.MOTIONHUMAN);

	// Loop through all of the raw events
	rawEvents.forEach(event => {
		// If for whatever reason the timestamp is before our start time, then don't include it.
		// This really shouldn't be necessary, but it seems sometimes the API gets confused and sends back some bounding boxes before the start time.
		// Either that or I'm doing something wrong, probably the latter tbh
		if (event.ts < startTime * 1000) return;

		if (!ids.has(event.objectId)) {
			// If the objectID does not already exists in our map, that means we need to create a new array for our events
			ids.set(event.objectId, [event]);
		} else {
			// Otherwise we can just push the event onto our existing array
			ids.get(event.objectId).push(event);
		}
	});

	// Create a final map which we will convert `ids` to so that it is a map of objectID to HumanEvent
	let events: Map<number, HumanEvent[]> = new Map();

	// Loop through all of our IDs
	ids.forEach(boxes => {
		// Loop through all of the bounding boxes for each object ID
		for (let box of boxes) {
			// If the width or height is too small, then we shouldn't really do anything with it. This is just to prevent really really wrong data.
			// The AI might put boxes around strange things that are too small so this is a good check.
			if (box.r - box.l < 0.02) return;
			if (box.b - box.t < 0.02) return;

			// Get the dimensions of the box
			let dimensions: Vec2 = { x: 0, y: 0 };
			dimensions.x = (box.r - box.l) / 10000;
			dimensions.y = (box.b - box.t) / 10000;

			// Get the position of the box
			let position: Vec2 = { x: 0, y: 0 };
			position.x = (box.r + box.l) / 2 / 10000;
			position.y = (box.b + box.t) / 2 / 10000;

			// Create a human event from this box
			const event = {
				id: box.objectId,
				position: position,
				dimensions: dimensions,
				timestamp: box.ts,
				camera: camera,
			};


			if (!events.has(box.objectId)) {
				// If the objectID does not already exists in our map, that means we need to create a new array for our events
				events.set(box.objectId, [event]);
			} else {
				// Otherwise we can just push the event onto our existing array
				events.get(box.objectId).push(event);
			}
		}
	});

	// Sort the HumanEvent arrays so that they are in ascending order of time
	events.forEach((boxes: HumanEvent[]) => boxes.sort(CompareHumanEventsByTime))

	// Return our events
	return events;
}
