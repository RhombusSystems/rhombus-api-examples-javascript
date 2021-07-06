/*
  *
  * @import necessary services
  * */
import { SendGraph, PlotGraphMessage, SendCameraPlot } from "./services/graph_service"

import { DetectionPipeline } from "./pipeline/detection_pipeline"
import { RelatedEventsPipeline } from "./pipeline/related_events_pipeline"
import { RelatedEventsIsolatorPipeline } from "./pipeline/related_event_isolator_pipeline"
import { ClipCombinerPipeline } from "./pipeline/clip_combiner_pipeline"
import { GetHumanEvents } from "./services/human_events_service"
import { IsolateEventsFromLength } from "./pipeline/isolators/event_length_isolator"
import { CollateHumanEvents } from "./pipeline/services/event_collator"
import { ExitEvent } from "./types/events"

import { CameraWebserviceApi } from "@rhombus/API"
import { Camera } from "./types/camera"
import { RHOMBUS_HEADERS } from "./utils/headers"

/*
  *
  * @import Connection URI Type for picking out the correct URI
  * */
import { ConnectionType } from "./types/connection_type"


/*
  *
  * @import Rhombus API configuration which will hold our API key
  * */
import { Configuration } from "@rhombus/API"

import { IOServer } from "./server/server"
import { GetCameraList } from "./services/camera_list"


import * as prompts from "prompts"

export interface RecentHumanEventInfo {
	timestamp: number;
	objectID: number;
	camera: Camera;
};

export const PrintRecentHumanEvents = async (configuration: Configuration, events: RecentHumanEventInfo[], cameras: Camera[]): Promise<void> => {
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);

	const baseFrameURIs: Map<string, string> = new Map();

	for (const cam of cameras) {
		const res = await api.getMediaUris({ cameraUuid: cam.uuid }, RHOMBUS_HEADERS);
		const vodURI = res.wanVodMpdUriTemplate;
		baseFrameURIs.set(cam.uuid, vodURI.substr(0, vodURI.indexOf("/dash")) + "/media/frame/");
	}

	let urls: string[] = [];
	let i = 0;

	for (const event of events) {
		const frameUri = baseFrameURIs.get(event.camera.uuid) + event.camera.uuid + "/" + event.timestamp + "/thumb.jpeg";
		urls.push("(" + i + ") URL: " + frameUri + "\n Object ID: " + event.objectID + "\n Timestamp: " + event.timestamp + "\n CameraUUID: " + event.camera.uuid);
		urls.push("--------------------------------------");
		i++;
	}
	console.log("Here are the recent human events in the last 10 minutes: ");
	urls.forEach(url => console.log(url));
}


/*
  *
  * Entry point 
  * @param {string} [apiKey] sets the API key that will be used throughout the application
  *
  * */
export const main = async (apiKey: string, type: ConnectionType) => {
	// Show a warning if running in WAN mode, because this is not recommended
	if (type == ConnectionType.WAN) {
		// Print in red
		console.log("\x1b[31m%s\x1b[0m", "Running in WAN mode! This is not recommended if it can be avoided");
	}

	// Create a `Configuration` which will use our API key, this config will be used in all further API calls
	const configuration = new Configuration({ apiKey: apiKey });

	const camList = await GetCameraList(configuration);

	let recent_human_events: RecentHumanEventInfo[] = [];

	const duration = 10 * 60;
	const currentTime = Math.round(new Date().getTime() / 1000) - duration;

	for (const cam of camList) {
		const human_events = await GetHumanEvents(configuration, cam, currentTime, duration)
		const isolated_events = IsolateEventsFromLength(CollateHumanEvents(human_events));
		isolated_events.forEach((es) => {
			const event = es[0];
			recent_human_events.push({
				timestamp: event.timestamp,
				objectID: event.id,
				camera: event.camera,
			});
		});
	}
	await PrintRecentHumanEvents(configuration, recent_human_events, camList);


	let selectedEvent: RecentHumanEventInfo;

	const autoSelectResponse = recent_human_events.length == 0 ? { selection: -1 } : await prompts({
		type: "number",
		name: "selection",
		message: "Please select a human event to follow. You can either use one of the events in the last 10 minutes OR you can type -1 to specify manually a custom objectID, timestamp, and camera.",
	});

	if (autoSelectResponse.selection == -1) {
		const manualSelectQuestions: prompts.PromptObject<string>[] = [
			{
				type: "number",
				name: "objectID",
				message: "Object ID of the person you would like to follow",
			},
			{
				type: "number",
				name: "timestamp",
				message: "Timestamp in miliseconds at which to start looking for this person",
			},
			{
				type: "text",
				name: "cameraUUID",
				message: "The camera UUID in which this person appears first",
			}
		];
		const response = await prompts(manualSelectQuestions);

		const camera = camList.find((element) => element.uuid == response.cameraUUID);

		if (camera == undefined) {
			console.log("Camera UUID not found!");
			return;
		}

		selectedEvent = {
			objectID: response.objectID,
			camera: camera,
			timestamp: response.timestamp
		};
	} else {
		selectedEvent = recent_human_events[autoSelectResponse.selection];
	}


	IOServer.StartServer();

	let res: ExitEvent[] = [];

	let msg: PlotGraphMessage = undefined;

	setInterval(() => {
		SendGraph(msg);
		if (res.length > 0) {
			SendCameraPlot(camList, res[0]);
		}
	}, 3000);

	// First really good example 86, 1625085357148, SdFCcHcOTwa4HcSZ3CpsFQ 
	// Walking between 3 cameras 158, 1625092837156, SdFCcHcOTwa4HcSZ3CpsFQ
	res = await DetectionPipeline(configuration, selectedEvent.camera, selectedEvent.objectID, Math.floor(selectedEvent.timestamp / 1000));

	if (res.length > 0) {
		const events = await RelatedEventsPipeline(configuration, res, camList);

		const relatedEventsRes = RelatedEventsIsolatorPipeline(events);
		msg = relatedEventsRes.msg;

		SendGraph(msg);

		if (relatedEventsRes.events.length > 0) {

			for (const event of relatedEventsRes.events) {
				if (event.followingEvent != undefined) {
					ClipCombinerPipeline(configuration, type, event);
				}
			}
		} else {
			console.log("No related events found for this object!");
		}
	} else {
		console.log("Object not detected properly! Is this person leaving the screen?");
	}
}
