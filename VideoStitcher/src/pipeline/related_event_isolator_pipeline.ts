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

import { PlotGraphMessage } from "../services/graph_service"
import { EnterEvent, ExitEvent, FinalizedEvent, EventsAreTheSame } from "../types/events"
import { CanCollateEvents, DoCollateEnterAndExit } from "./services/event_collator"

/*
  *
  * @method Recursively creates finalized events based on an EnterEvent | ExitEvent
  *
  * @param {EnterEvent | ExitEvent} [event] The event to recursively create a finalized event from
  *
  * @return {FinalizedEvent} Returns a finalized event based on the provided enter/exit event
  * */
const InternalFinalizeEvent = (event: EnterEvent | ExitEvent): FinalizedEvent => {
	// If we reach the end of our recursion, return undefined because this will set the finalized event `followingEvent` member as undefined, which will indicate the end of a chain
	if (event == undefined) return undefined;

	// Get the list of events
	const events = event.events;

	// Return a finalized event
	return {
		id: event.id,
		startTime: events[0].timestamp,
		endTime: events[event.events.length - 1].timestamp,
		data: events,
		// We only want to set a following event, if the `event` is an `ExitEvent`. Otherwise we want it to be undefined. We will use the exit event's first related event as the following event
		followingEvent: 'relatedEvents' in event ? InternalFinalizeEvent((<ExitEvent>event).relatedEvents[0]) : undefined,
	};
}

/*
  *
  * @export
  * @method Finalizes exit events to be used for the dev tools and when combining clips
  *
  * @param {exitEvents} [ExitEvent[]] The array of exitEvents to finalize
  *
  * @return {FinalizedEvent[]} Returns the finalized versions of all of the provided exit events
  * */
export const FinalizeExitEvents = (exitEvents: ExitEvent[]): FinalizedEvent[] => {
	// Create our array of finalized events
	let finalEvents: FinalizedEvent[] = [];

	// Loop through all of the exit events
	for (const exitEvent of exitEvents) {

		// Create the finalized events
		finalEvents.push(InternalFinalizeEvent(exitEvent));
	}
	return finalEvents;
}

/*
  *
  * @export
  * @interface FinalEventResponse
  * */
export interface FinalEventResponse {
	/*
	  * @type {FinalizedEvent[]} The array of finalized events
	  * @memberof FinalEventResponse
	  * */
	events: FinalizedEvent[],

	/*
	  * @type {PlotGraphMessage} The message to be sent to the dev tools
	  * @memberof FinalEventResponse
	  * */
	msg: PlotGraphMessage;
};


/*
  *
  * @export
  * @method Isolates related events and finalizes them
  *
  * @param {ExitEvent[]} [exitEvents] The array of exit events which will be finalized
  *
  * @return {FinalEventResponse} Returns the finalized events and msg which will be sent to the devtools
  * */
export const RelatedEventsIsolatorPipeline = (exitEvents: ExitEvent[]): FinalEventResponse => {
	// Loop through all of the exit events starting from the end
	for (let i = exitEvents.length - 1; i >= 0; i--) {
		const currentExitEvent = exitEvents[i];
		// Loop through all of the related events attached to the currentExitEvent
		for (let j = 0; j < currentExitEvent.relatedEvents.length; j++) {
			const currentRelatedEvent = currentExitEvent.relatedEvents[j];
			// Loop through all of the exit events that follow the currentExitEvent
			//
			// Here we will attempt to chain any exit events following currentExitEvent to currentRelatedEvent
			for (let k = i + 1; k < exitEvents.length; k++) {
				const otherExitEvent = exitEvents[k];

				if (CanCollateEvents(currentRelatedEvent, otherExitEvent)) {
					// If the currentRelatedEvent and the otherExitEvent can be collated, as in the currentRelatedEvent and otherExitEvent reasonably follow a pattern 
					// that looks like they are related.

					// Then do a collation between the two
					exitEvents[i].relatedEvents[j] = DoCollateEnterAndExit(currentRelatedEvent, otherExitEvent);

					// And remove the extraneous exit event
					exitEvents.splice(k, 1);

					// Nothing more to do with any other following exit events so we will break
					break;
				} else if (EventsAreTheSame(currentRelatedEvent, otherExitEvent)) {
					// If the currentRelatedEvent and the otherExitEvent are the same, as in they are literally the same event

					// Then just set the related event as otherExitEvent (so that it has any relatedEvents that are attached to otherExitEvent)
					exitEvents[i].relatedEvents[j] = otherExitEvent;

					// And remove the extraneous exit event
					exitEvents.splice(k, 1);

					// Nothing more to do with any other following exit events so we will break
					break;
				}
			}
		}
	}

	// Finalize the exit events
	const res = FinalizeExitEvents(exitEvents);

	// Then return our data
	return {
		msg: {
			// The devtools can only show one related event so we'll just show the first one
			event: res[0],
		},
		events: res,
	};
}
