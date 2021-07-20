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

import { HumanEvent } from "../../types/human_event"
import { Environment } from "../../environment/environment"

/*
  *
  * @export
  * @method Isolates events and only returns events that are at the edge of the camera's viewport
  *
  * @param {Map<number, HumanEvent[]>} [allEvents] A map of objectID to human event list
  *
  * @return {Map<number, HumanEvent[]>} Returns the resulting vector [a.x + b.x, a.y + b.y]
  * */
export const IsolateEdgeEvents = (allEvents: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	// Create a new map for our edge events
	let edgeEvents: Map<number, HumanEvent[]> = new Map();

	// Loop through all of the events
	allEvents.forEach((events) => {
		// The last event is what matters for us, since this isolator is only used for the exit event detection pipeline
		const event = events[events.length - 1];

		// Edge values
		const smallEdge = Environment.EdgeEventDetectionDistanceFromEdge;
		const largeEdge = 1 - Environment.EdgeEventDetectionDistanceFromEdge;

		// If the position of the event is above our threshold, then we can add the events to our edge events map
		if (event.position.y < smallEdge || event.position.y > largeEdge || event.position.x < smallEdge || event.position.x > largeEdge)
			edgeEvents.set(event.id, events);

	});

	// Return the edge events
	return edgeEvents;
}
