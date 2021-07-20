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
  * @method Isolates events and only returns events that have a minimum number of events
  *
  * @param {Map<number, HumanEvent[]>} [events] A map of objectID to human event list
  *
  * @return {Map<number, HumanEvent[]>} Returns only events that have at least `Environment.MinimumEventLength` events
  * */
export const IsolateEventsFromLength = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	// Loop through all of the events
	events.forEach((es: HumanEvent[], id: number,) => {
		// If the number of events does not pass the threshold, then delete them
		if (es.length < Environment.MinimumEventLength)
			events.delete(id);
	});
	return events;
}
