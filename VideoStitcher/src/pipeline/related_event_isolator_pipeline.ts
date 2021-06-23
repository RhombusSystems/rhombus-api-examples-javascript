import { PlotGraphMessage } from "../services/graph_service"
import { EnterEvent, ExitEvent, FinalizedEvent, ExitEventIsRelated, EventsAreTheSame } from "../types/events"
import { CanCollateEvents, DoCollateEnterAndExit } from "../services/event_collator"
import { IsolateHumanEventsFromObjectID } from "../services/object_id_isolator"

export const InternalFinalizeEvents = (event: EnterEvent | ExitEvent): FinalizedEvent => {
	if (event == undefined) return undefined;
	return {
		id: event.id,
		startTime: event.events[0].timestamp,
		endTime: event.events[event.events.length - 1].timestamp,
		data: IsolateHumanEventsFromObjectID(event.events, true),
		followingEvent: 'relatedEvents' in event ? InternalFinalizeEvents((<ExitEvent>event).relatedEvents[0]) : undefined,
	};
}

export const FinalizeExitEvents = (exitEvents: ExitEvent[]): FinalizedEvent[] => {
	let finalEvents: FinalizedEvent[] = [];
	for (const exitEvent of exitEvents) {
		finalEvents.push(InternalFinalizeEvents(exitEvent));
	}
	return finalEvents;
}

export interface FinalEventResponses {
	events: FinalizedEvent[],
	msg: PlotGraphMessage;
};

export const RelatedEventsIsolatorPipeline = (exitEvents: ExitEvent[]): FinalEventResponses => {
	for (let i = exitEvents.length - 1; i >= 0; i--) {
		const currentExitEvent = exitEvents[i];
		for (let j = 0; j < currentExitEvent.relatedEvents.length; j++) {
			const currentRelatedEvent = currentExitEvent.relatedEvents[j];
			for (let k = i + 1; k < exitEvents.length; k++) {
				const otherExitEvent = exitEvents[k];
				if (CanCollateEvents(currentRelatedEvent, otherExitEvent)) {
					exitEvents[i].relatedEvents[j] = DoCollateEnterAndExit(currentRelatedEvent, otherExitEvent);
					exitEvents.splice(k, 1);
					break;
				} else if (EventsAreTheSame(currentRelatedEvent, otherExitEvent)) {
					exitEvents[i].relatedEvents[j] = otherExitEvent;
					exitEvents.splice(k, 1);
					break;
				}
			}
		}
	}

	const res = FinalizeExitEvents(exitEvents);

	return {
		msg: {
			event: res[0],
			id: new Date().getTime(),
		},
		events: res,
	};
}
