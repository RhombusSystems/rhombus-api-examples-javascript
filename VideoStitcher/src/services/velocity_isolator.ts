import { HumanEvent } from "../types/human_event"

import { EdgeEventsType } from "./edge_event_detector"


export const IsolateVelocities = (events: Map<number, HumanEvent[]>, type: EdgeEventsType, camUUID: string): Map<number, HumanEvent[]> => {
	events.forEach((es) => {
		let velocity;
		const finalEvent = es[es.length - 1];
		const beginEvent = es[0];

		if (type == EdgeEventsType.End) {
			const determiningEvent = es[es.length - 2];
			velocity = finalEvent.position.x - determiningEvent.position.x;
		} else if (type == EdgeEventsType.Begin) {
			const determiningEvent = es[1];
			velocity = determiningEvent.position.x - beginEvent.position.x;

		}

		if (Math.abs(velocity) < 0.025) {
			events.delete(finalEvent.id);
			// console.log("Velocity didn't make the cut " + velocity);
			// console.log("https://console.rhombussystems.com/devices/cameras/" + process.env.CAM_UUID + "/?t=" + finalEvent.timestamp)
		} else {

			const movingRight = velocity > 0;
			const movingLeft = velocity < 0;

			if (type == EdgeEventsType.End) {
				const eventOnRight = finalEvent.position.x > 0.75;
				const eventOnLeft = finalEvent.position.x < 0.25;
				if (movingRight && eventOnLeft) {
					events.delete(finalEvent.id);
				} else if (movingLeft && eventOnRight) {
					events.delete(finalEvent.id);
				}
			} else if (type == EdgeEventsType.Begin) {
				console.log("Begin");
				const eventOnRight = beginEvent.position.x > 0.75;
				const eventOnLeft = beginEvent.position.x < 0.25;
				if (movingLeft && eventOnLeft) {
					events.delete(beginEvent.id);
				} else if (movingRight && eventOnRight) {
					events.delete(beginEvent.id);
				} else {
					console.log("Begin counts: " + velocity + ", " + beginEvent.position.x + ", " + es[1].position.x);
					console.log("https://console.rhombussystems.com/devices/cameras/" + camUUID + "/?t=" + beginEvent.timestamp)
					console.log("https://console.rhombussystems.com/devices/cameras/" + camUUID + "/?t=" + es[1].timestamp)
				}
			}
		}
	});

	return events;
}
