import { HumanEvent } from "../../types/human_event"
import { Environment } from '../../environment/environment'

export const IsolateHumanEventsFromObjectID = (es: HumanEvent[], startFromBeginning: boolean = false): HumanEvent[] => {
	const cutoffMiliseconds = Environment.ObjectIDMaxLengthSeconds;
	if (startFromBeginning) {
		for (let i = 0; i < es.length - 2; i++) {
			const event = es[i];
			const followingEvent = es[i + 1];
			if (followingEvent.timestamp - event.timestamp > cutoffMiliseconds) {
				es.splice(i + 1, es.length - 1);
				return es;
			}
		}
	} else {
		for (let i = es.length - 2; i >= 0 && i <= es.length - 2; i--) {
			const event = es[i];
			const followingEvent = es[i + 1];
			if (followingEvent.timestamp - event.timestamp > cutoffMiliseconds) {
				es.splice(0, i + 1);
			}
		}
	}
	return es;
}

export const IsolateEventsFromObjectID = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	events.forEach((es) => IsolateHumanEventsFromObjectID(es));
	return events;
}
