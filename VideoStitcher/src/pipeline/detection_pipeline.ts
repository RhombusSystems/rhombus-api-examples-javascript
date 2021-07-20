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

import { ExitEvent, EdgeEventsType, ExitEventsFromMap } from "../types/events"

import { Configuration } from "@rhombus/API"

import { GetHumanEvents } from "../services/human_events_service"
import { IsolateEdgeEvents } from "./isolators/edge_event_isolator"
import { IsolateVelocities } from "./isolators/velocity_isolator"
import { IsolateEventsFromLength } from "./isolators/event_length_isolator"
import { IsolateObjectIDEvents } from "./services/object_id_isolator"
import { Camera } from "../types/camera"
import { CompareEvents } from "../types/events"

import { Environment } from "../environment/environment"

/*
  *
  * @export
  * @method Parses through human events to find exit events
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  * @param {Camera} [camera] The camera to look for human events
  * @param {number} [objectID] The object ID to look for
  * @param {number} [timestamp] The timestamp at which to look for human events
  *
  * @return {Promise<ExitEvent[]>} Returns an array of exit events that match the object ID
  * */
export const DetectionPipeline = async (configuration: Configuration, camera: Camera, objectID: number, timestamp: number): Promise<ExitEvent[]> => {

	// Get the duration of time in seconds to look for human events. This is by default 10 minutes.
	const duration = Environment.ExitEventDetectionDurationSeconds;

	// A small offset in seconds is good so that we don't accidentally barely miss the object ID. This is by default 30 seconds.
	const offset = Environment.ExitEventDetectionOffsetSeconds;

	// Get an array of human events within the timeframe
	const res = await GetHumanEvents(configuration, camera, timestamp - offset, duration)

	console.log(res.size + " humans found");

	// Isolate the human events by length
	const isolatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(res));

	console.log(isolatedEvents.size + " were found from length and object IDs");

	// Isolate the human events by edge and then by length 
	const edgeEvents = IsolateEventsFromLength(IsolateEdgeEvents(isolatedEvents));

	console.log(edgeEvents.size + " were found from being close to the edge");

	// Isolate the human events by velocity
	const exitEvents = IsolateVelocities(edgeEvents, EdgeEventsType.End);

	console.log(exitEvents.size + " were found from velocity");

	// Convert our raw map of objectID to HumanEvent[] to an array of ExitEvents
	const events = ExitEventsFromMap(exitEvents);

	// Only include exit events that actually contain our object ID
	events.filter(event => {
		// Loop through all of the events attached to this exit event, and return true if at least one matches our object ID
		for (const humanEvent of event.events) {
			if (humanEvent.id == objectID) return true;
		}

		// If none were found with our objectID, then return false and this ExitEvent will not be included
		return false;
	});

	// Sort all of the events by time
	events.sort(CompareEvents);

	// Sort all of the related events also
	events.forEach(e => e.relatedEvents.sort(CompareEvents));
	return events;
}
