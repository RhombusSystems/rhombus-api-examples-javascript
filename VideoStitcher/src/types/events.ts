import { GetVelocity } from "../utils/velocity";
import { HumanEvent } from "./human_event"
import { Vec2 } from "./vector";

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
	  * @type {Vec2} The X and Y velocity in permyriad position of the box / second. 
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
	  * @type {Vec2} The X and Y velocity in permyriad position of the box / second. 
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

export const EnterEventsFromMap = (events: Map<number, HumanEvent[]>): EnterEvent[] => {
	let resultEvents: EnterEvent[] = [];
	events.forEach((es, id) => {
		resultEvents.push({
			events: es,
			id: id,
			velocity: GetVelocity(es[0], es[1]),
		});
	});
	resultEvents.sort((a, b) => {
		if (a.events[0].timestamp < b.events[0].timestamp) return -1;
		if (a.events[0].timestamp > b.events[0].timestamp) return 1;
		return 0;
	});
	return resultEvents;
}

export const ExitEventsFromMap = (events: Map<number, HumanEvent[]>): ExitEvent[] => {
	let resultEvents: ExitEvent[] = [];
	events.forEach((es, id) => {
		resultEvents.push({
			events: es,
			id: id,
			relatedEvents: [],
			velocity: GetVelocity(es[es.length - 2], es[es.length - 1]),
		});
	});
	resultEvents.sort((a, b) => {
		if (a.events[0].timestamp < b.events[0].timestamp) return -1;
		if (a.events[0].timestamp > b.events[0].timestamp) return 1;
		return 0;
	});
	return resultEvents;
}

export const EventsAreTheSame = (a: EnterEvent, b: EnterEvent) => {
	const aFirst = a.events[0];
	const bFirst = b.events[0];
	if (aFirst.timestamp == bFirst.timestamp && aFirst.camera.uuid == bFirst.camera.uuid && aFirst.dimensions == bFirst.dimensions && aFirst.position == bFirst.dimensions) return true;
	return false;
}

export const ExitEventIsRelated = (event: ExitEvent, previousEvent: ExitEvent): boolean => {
	for (const relatedEvent of previousEvent.relatedEvents) {
		if (EventsAreTheSame(relatedEvent, event)) return true;
	}
	return false;
}
