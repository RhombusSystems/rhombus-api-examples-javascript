import { GetVelocity } from "../utils/velocity";
import { HumanEvent } from "./human_event"
import { Vec2 } from "./vector";

/*
  *
  * @export
  * @enum Enum to specify whether an edge event occurs at the beginning or the end
  * */
export enum EdgeEventsType {
	Begin,
	End,
};

/*
  *
  * @export
  * @interface EnterEvent
  * 
  * This is represents an event where someone walks into view of a the camera, either from the top, bottom, left, or right.
  * */
export interface EnterEvent {
	/*
	  * @type {number} The ObjectID of this enter event. 
	  * NOTE: This is not necessarily the objectID that will appear in all of the `events` simply due to event collation, 
	  * but it is a general ID that we use to identify different enter and exit events
	  *
	  * @memberof EnterEvent
	  * */
	id: number;

	/*
	  * @type {HumanEvent[]} The array of human events that are attached to this enter event
	  * @memberof EnterEvent
	  * */
	events: HumanEvent[];

	/*
	  * @type {Vec2} The X and Y velocity in permyriad position of the box / milisecond. 
	  * This is just the velocity of the bounding box, it is not really a good indicator of the velocity of the real object, 
	  * but we use it regardless for the isolation of different events
	  *
	  * @memberof EnterEvent
	  * */
	velocity: Vec2;
};

/*
  *
  * @export
  * @interface ExitEvent
  * 
  * This is represents an event where someone walks out of view of a camera, either from the top, bottom, left, or right.
  * */
export interface ExitEvent {
	/*
	  * @type {number} The ObjectID of this exit event. 
	  * NOTE: This is not necessarily the objectID that will appear in all of the `events` simply due to event collation, 
	  * but it is a general ID that we use to identify different enter and exit events
	  *
	  * @memberof ExitEvent
	  * */
	id: number;

	/*
	  * @type {HumanEvent[]} The array of human events that are attached to this exit event
	  * @memberof ExitEvent
	  * */
	events: HumanEvent[];

	/*
	  * @type {EnterEvent[]} The array of related enter events that could follow this exit event.
	  * This type is used at a stage in isolation where we cannot be sure which of these enter events best match for this exit event, which is why this is an array. 
	  * This member is best characterized as any enter events which could possibly be related to this exit event
	  *
	  * @memberof ExitEvent
	  * */
	relatedEvents: EnterEvent[];

	/*
	  * @type {Vec2} The X and Y velocity in permyriad position of the box / milisecond. 
	  * This is just the velocity of the bounding box, it is not really a good indicator of the velocity of the real object, 
	  * but we use it regardless for the isolation of different events
	  *
	  * @memberof ExitEvent
	  * */
	velocity: Vec2;
};

/*
  *
  * @export
  * @interface FinalizedEvent
  * 
  * A finalized event is the final output of the detection pipeline. 
  * It is an event where a human was detected leaving, and there were one or more following enter and exit events 
  * which can reasonably be assumed to be the same person walking into view or out of view of another camera
  * */
export interface FinalizedEvent {
	/*
	  * @type {number} The ObjectID of this enter event. 
	  * NOTE: This is not necessarily the objectID that will appear in all of the `data` events simply due to event collation, 
	  * but it is a general ID that we use to identify different enter and exit events
	  *
	  * @memberof FinalizedEvent
	  * */
	id: number;

	/*
	  * @type {HumanEvent[]} The array of human events that are attached to this finalized event
	  * @memberof FinalizedEvent
	  * */
	data: HumanEvent[],

	/*
	  * @type {FinalizedEvent | undefined} A finalized event (either enter or exit) which are related. 
	  * For example, if this event was of someone leaving the camera, the followingEvent could be when someone enters the camera.
	  * This member could also be undefined if there is no following event
	  *
	  * @memberof FinalizedEvent
	  * */
	followingEvent: FinalizedEvent | undefined;

	/*
	  * @type {number} The time in miliseconds of the first event in `data`.
	  * @memberof FinalizedEvent
	  * */
	startTime: number,

	/*
	  * @type {number} The time in miliseconds of the last event in `data`.
	  * @memberof FinalizedEvent
	  * */
	endTime: number

};

/*
  *
  * @export
  * @method Compares 2 human events based on their timestamps
  *
  * @param {HumanEvent} [a] The first human event
  * @param {HumanEvent} [b] The second human event
  *
  * @return {number} Returns -1 if `a` is before `b`, 1 if `b` is before `a`, and 0 if `a` and `b` occur at the same time
  * */
export const CompareHumanEventsByTime = (a: HumanEvent, b: HumanEvent): number => {
	if (a.timestamp < b.timestamp) return -1;
	if (a.timestamp > b.timestamp) return 1;
	return 0;
}

/*
  *
  * @export
  * @method Compares 2 Enter events based on the timestamp of the first human event
  *
  * @param {EnterEvent} [a] The first enter event
  * @param {EnterEvent} [b] The second enter event
  *
  * @return {number} Returns -1 if `a` is before `b`, 1 if `b` is before `a`, and 0 if `a` and `b` occur at the same time
  * */
export const CompareEvents = (a: EnterEvent, b: EnterEvent): number => {
	return CompareHumanEventsByTime(a.events[0], b.events[0]);
}

/*
  *
  * @export
  * @method Gets a list of enter events from a map of raw human events
  *
  * @param {Map<number, HumanEvent[]>} [events] The map of objectID to raw human event array
  *
  * @return {EnterEvent[]} Returns the list of EnterEvents that correspond to the map of human events
  * */
export const EnterEventsFromMap = (events: Map<number, HumanEvent[]>): EnterEvent[] => {
	// Create our array of resulting events
	let resultEvents: EnterEvent[] = [];

	// Loop through all of the events
	events.forEach((es, id) => {
		// Push an EnterEvent for each of our resulting events
		resultEvents.push({
			// The ID will be our key in our map
			id: id,
			// The events will be the value in our map
			events: es,
			// The velocity will just be the velocity between the first event and the second, since this is an enter event and that's the only velocity we really care about
			velocity: GetVelocity(es[0], es[1]),
		});
	});

	// Sort the resulting events based on their timestamp
	resultEvents.sort(CompareEvents);

	// Return the resulting enter events
	return resultEvents;
}

/*
  *
  * @export
  * @method Gets a list of exit events from a map of raw human events
  *
  * @param {Map<number, HumanEvent[]>} [events] The map of objectID to raw human event array
  *
  * @return {EnterEvent[]} Returns the list of ExitEvents that correspond to the map of human events
  * */
export const ExitEventsFromMap = (events: Map<number, HumanEvent[]>): ExitEvent[] => {
	// Create our array of resulting events
	let resultEvents: ExitEvent[] = [];

	// Loop through all of the events
	events.forEach((es, id) => {
		// Push an ExitEvent for each of our resulting events
		resultEvents.push({
			// The ID will be our key in our map
			id: id,
			// The events will be the value in our map
			events: es,
			// The velocity will just be the velocity between the first event and the second, since this is an enter event and that's the only velocity we really care about
			velocity: GetVelocity(es[es.length - 2], es[es.length - 1]),
			// The related events will be empty because we don't have that information, this will be updated later in the program
			relatedEvents: [],
		});
	});
	// Sort the resulting events based on their timestamp
	resultEvents.sort(CompareEvents);

	// Return the resulting exit events
	return resultEvents;
}

/*
  *
  * @export
  * @method Determines if two enter or exit events are the same, based on the timestamp, camera UUID, the dimensions of the box, and the position.
  * NOTE: We don't compare the object ID because this value is not very accurate.
  *
  * @param {EnterEvent} [a] The first enter event
  * @param {EnterEvent} [b] The second enter event
  *
  * @return {boolean} Returns the true if both of the events are the same
  * */
export const EventsAreTheSame = (a: EnterEvent, b: EnterEvent): boolean => {
	const aFirst = a.events[0];
	const bFirst = b.events[0];

	return aFirst.timestamp == bFirst.timestamp && aFirst.camera.uuid == bFirst.camera.uuid && aFirst.dimensions == bFirst.dimensions && aFirst.position == bFirst.position;
}

/*
  *
  * @export
  * @method Determines if two exit events are somehow related, in that the related event of one is the same as the our own one. This is used for chaining exit events together.
  * For example if one exit event has a related event that matches another exit event, then we will assume that the first exit event has a related event which is our second exit event,
  * thus chaining exit event 2 to exit event 1
  *
  * @param {ExitEvent} [event] An exit event
  * @param {ExitEvent} [previousEvent] The exit event that occurs before `event`
  *
  * @return {boolean} Returns true if `event` can be changed to `previousEvent`
  * */
export const ExitEventIsRelated = (event: ExitEvent, previousEvent: ExitEvent): boolean => {
	// Loop through all of the related events of `previousEvent`
	for (const relatedEvent of previousEvent.relatedEvents) {
		// If the exit events are the same, then we will return true because `event` can be chained to `previousEvent`
		if (EventsAreTheSame(relatedEvent, event)) return true;
	}

	// If none of the related events of `previousEvent` match `event`, then `event` cannot be chained to `previousEvent`
	return false;
}
