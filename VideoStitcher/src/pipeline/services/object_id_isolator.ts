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

/*
  *
  * @export
  * @method Isolates human events to make sure that they don't run longer than 30 seconds
  * @param {HumanEvent[]} [es] The list of human events to isolate
  * @param {boolean} [startFromBeginning] Whether to start isolating events from the beginning, false by default
  * @return {HumanEvent[]} The array of isolated human events
  * */
export const IsolateHumanEventsFromObjectID = (es: HumanEvent[], startFromBeginning: boolean = false): HumanEvent[] => {
	if (startFromBeginning) {
		for (let i = 0; i < es.length - 2; i++) {
			const event = es[i];
			const followingEvent = es[i + 1];
			if (followingEvent.timestamp - event.timestamp > 30 * 1000) {
				es.splice(i + 1, es.length - 1);
				return es;
			}
		}
	} else {
		for (let i = es.length - 2; i >= 0 && i <= es.length - 2; i--) {
			const event = es[i];
			const followingEvent = es[i + 1];
			if (followingEvent.timestamp - event.timestamp > 30 * 1000) {
				es.splice(0, i + 1);
			}
		}
	}
	return es;
}

/*
  *
  * @export
  * @method Isolates human events from how long the ObjectID lasts by calling `IsolateHumanEventsFromObjectID`
  * @param {Map<number, HumanEvent[]>} [events] The map of ObjectID to array of human events.
  * @param {startFromBeginning} [boolean] Whether to start isolating events from the beginning, false by default
  * */
export const IsolateObjectIDEvents = (events: Map<number, HumanEvent[]>, startFromBeginning: boolean = false): Map<number, HumanEvent[]> => {
	events.forEach((es) => IsolateHumanEventsFromObjectID(es, startFromBeginning));
	return events;
}
