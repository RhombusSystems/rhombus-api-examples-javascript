import { HumanEvent } from "./human_event"

export interface EnterEvent {
	events: HumanEvent[];
	id: number;
};

export const EnterEventsFromMap = (events: Map<number, HumanEvent[]>): EnterEvent[] => {
	let resultEvents: EnterEvent[] = [];
	events.forEach((es, id) => {
		resultEvents.push({
			events: es,
			id: id,
		});
	});
	resultEvents.sort((a, b) => {
		if (a.events[0].timestamp < b.events[0].timestamp) return -1;
		if (a.events[0].timestamp > b.events[0].timestamp) return 1;
		return 0;
	});
	return resultEvents;
}

export interface ExitEvent {
	events: HumanEvent[];
	id: number;
	relatedEvents: EnterEvent[];
};
export interface FinalizedEvent {
	id: number;
	followingEvent: FinalizedEvent | undefined;
	startTime: number,
	endTime: number
	data: HumanEvent[],
};


export const ExitEventsFromMap = (events: Map<number, HumanEvent[]>): ExitEvent[] => {
	let resultEvents: ExitEvent[] = [];
	events.forEach((es, id) => {
		resultEvents.push({
			events: es,
			id: id,
			relatedEvents: [],
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
	// if (a.id == b.id) return true;
	const aFirst = a.events[0];
	const bFirst = b.events[0];
	if (aFirst.timestamp == bFirst.timestamp && aFirst.camUUID == bFirst.camUUID && aFirst.dimensions == bFirst.dimensions && aFirst.position == bFirst.dimensions && aFirst.camUUID == bFirst.camUUID) return true;
	return false;
}

export const ExitEventIsRelated = (event: ExitEvent, previousEvent: ExitEvent): boolean => {
	for (const relatedEvent of previousEvent.relatedEvents) {
		if (EventsAreTheSame(relatedEvent, event)) return true;
	}
	return false;
}
