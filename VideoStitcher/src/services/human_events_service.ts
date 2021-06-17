import { Configuration, CameraWebserviceApi, FootageBoundingBoxType, ActivityEnum } from "@rhombus/API";
import { RHOMBUS_HEADERS } from "../utils/headers"

import { HumanEvent } from "../types/human_event"

import { Vec2 } from "../types/vector"


export const GetHumanEvents = async (config: Configuration, camUuid: string, startTime: number, duration: number): Promise<Map<number, HumanEvent[]>> => {
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(config);

	let ids = new Map<number, FootageBoundingBoxType[]>();

	const res = await api.getFootageBoundingBoxes({ cameraUuid: camUuid, startTime: startTime, duration: duration }, RHOMBUS_HEADERS);

	let rawEvents: FootageBoundingBoxType[] = res.footageBoundingBoxes.filter((event) => event.a == ActivityEnum.MOTIONHUMAN);

	rawEvents.forEach(event => {
		if (event.ts < startTime) return;
		if (!ids.has(event.objectId)) {
			ids.set(event.objectId, [event]);
		} else {
			ids.get(event.objectId).push(event);
		}
	});

	ids.forEach((events) => {
		if (events.length < 1) {
			ids.delete(events[0].objectId);
		}
	});

	let events: Map<number, HumanEvent[]> = new Map();

	ids.forEach((boxes: FootageBoundingBoxType[]) => {
		for (let box of boxes) {
			if (box.r - box.l < 0.02) return;
			if (box.b - box.t < 0.02) return;
			let dimensions: Vec2 = { x: 0, y: 0 };
			dimensions.x = (box.r - box.l) / 10000;
			dimensions.y = (box.b - box.t) / 10000;
			let position: Vec2 = { x: 0, y: 0 };
			position.x = (box.r + box.l) / 2 / 10000;
			position.y = (box.b + box.t) / 2 / 10000;
			const event = {
				position: position,
				dimensions: dimensions,
				id: box.objectId,
				timestamp: box.ts,
				camUUID: camUuid,
			};


			if (!events.has(box.objectId)) {
				events.set(box.objectId, [event]);
			} else {
				events.get(box.objectId).push(event);
			}
		}
	});

	events.forEach((boxes: HumanEvent[]) => {
		boxes.sort((a, b) => {
			if (a.timestamp < b.timestamp) return -1;
			if (a.timestamp > b.timestamp) return 1;
			return 0;
		});
	})
	return events;
}
