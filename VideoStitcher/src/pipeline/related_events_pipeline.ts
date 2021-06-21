
import { ConvertMapToList, PlotGraphMessage } from "../services/graph_service"
import { HumanEvent } from "../types/human_event"
import { Configuration } from "@rhombus/API"
import { GetCameraList } from "../services/camera_list"
import { GetHumanEvents } from "../services/human_events_service"
import { DetectEdgeEvents, EdgeEventsType } from "../services/edge_event_detector"
import { IsolateObjectIDEvents } from "../services/object_id_isolator"
import { IsolateVelocities } from "../services/velocity_isolator"
import { IsolateEventsFromLength } from "../services/event_length_isolator"
import { CollateEvents } from "../services/event_collator"

export interface RelatedEventsPipelineResult {
	graphMsg: PlotGraphMessage;
	relatedEvents: HumanEvent[][];
};

export const RelatedEventsPipeline = async (configuration: Configuration, camUUID: string, exitEvents: Map<number, HumanEvent[]>): Promise<RelatedEventsPipelineResult> => {
	const cameraUUIDs = await GetCameraList(configuration, camUUID);

	let graphMsg: PlotGraphMessage = {
		events: ConvertMapToList(exitEvents),
		relatedEvents: [],
		id: new Date().getTime(),
	};

	let relatedEvents: HumanEvent[][] = [];

	// exitEvents.forEach(async (events: HumanEvent[]) => {
	for (const key of exitEvents) {
		const events = key[1];
		const startTime = Math.floor(events[events.length - 1].timestamp / 1000);
		const detectionDuration = 30;

		for (const otherCamUUID of cameraUUIDs) {
			const otherHumanEvents = await GetHumanEvents(configuration, otherCamUUID, startTime, detectionDuration);
			const collatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(CollateEvents(otherHumanEvents)));
			const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(collatedEvents, EdgeEventsType.Begin));
			const velocityEvents = IsolateVelocities(edgeEvents, EdgeEventsType.Begin, otherCamUUID);
			console.log("other events " + otherCamUUID + ", " + edgeEvents.size);

			graphMsg.relatedEvents = graphMsg.relatedEvents.concat(ConvertMapToList(velocityEvents));
			relatedEvents.push(ConvertMapToList(velocityEvents));
		}
	}
	return {
		graphMsg: graphMsg,
		relatedEvents: relatedEvents,
	};
}
