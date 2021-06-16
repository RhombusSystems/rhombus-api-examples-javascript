import { HumanEvent } from "../types/human_event"

export const IsolateVelocities = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	events.forEach((es) => {
		const finalEvent = es[es.length - 1];
		const determiningEvent = es[es.length - 2];
		const velocity = finalEvent.position.x - determiningEvent.position.x;
		if (Math.abs(velocity) < 0.01) {
			events.delete(finalEvent.id);
			console.log("Velocity didn't make the cut " + velocity);
			console.log("https://console.rhombussystems.com/devices/cameras/" + process.env.CAM_UUID + "/?t=" + finalEvent.timestamp)
		} else {
			if (velocity > 0 && finalEvent.position.x < 0.05) {
				events.delete(finalEvent.id);
			} else if (velocity < 0 && finalEvent.position.x > 0.95) {
				events.delete(finalEvent.id);
			}
		}
	});

	return events;
}
