import { CameraWebserviceApi } from "@rhombus/API"
import { Camera } from "../types/camera"
import { RHOMBUS_HEADERS } from "../utils/headers"
import { Configuration } from "@rhombus/API"

import { GetHumanEvents } from "../services/human_events_service"
import { IsolateEventsFromLength } from "../pipeline/isolators/event_length_isolator"

import { Environment } from "../environment/environment"

import * as prompts from "prompts"

/*
  *
  * @export
  * @interface RecentHumanEventInfo
  * */
export interface RecentHumanEventInfo {
	/*
	  * @type {number} The timestamp in miliesconds of this human event
	  * @memberof RecentHumanEventInfo
	  * */
	timestamp: number;

	/*
	  * @type {number} The ObjectID of the HumanEvent
	  * @memberof RecentHumanEventInfo
	  * */
	objectID: number;

	/*
	  * @type {number} The camera of this HumanEvent
	  * @memberof RecentHumanEventInfo
	  * */
	camera: Camera;
};

/*
  *
  * @export
  * @method Prints a list of human events to the console so that the user can choose one
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests.
  * @param {RecentHumanEventInfo[]} [events] The array of recent human events.
  * @param {Camera[]} [cameras] The array of available cameras.
  * */
export const PrintRecentHumanEvents = async (configuration: Configuration, events: RecentHumanEventInfo[], cameras: Camera[]): Promise<void> => {
	// Create the API
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);

	// Declare the base frame URIs for use later. These URIs in combination with the recent human event info will give us URLs to image frames of recent human events.
	const baseFrameURIs: Map<string, string> = new Map();

	// Loop through all of the cameras
	for (const cam of cameras) {
		// Get the media URI of that camera
		const res = await api.getMediaUris({ cameraUuid: cam.uuid }, RHOMBUS_HEADERS);

		// Get the URI Template
		const vodURI = res.wanVodMpdUriTemplate;

		// Create our base frame URI in our map to our cam UUID for easy access later.
		baseFrameURIs.set(cam.uuid, vodURI.substr(0, vodURI.indexOf("/dash")) + "/media/frame/");
	}

	console.log("Here are the recent human events in the last 10 minutes: ");

	// Loop through all of the events
	let i = 0;
	for (const event of events) {
		// Now get our frame URI to present to the user.
		const frameUri = baseFrameURIs.get(event.camera.uuid) + event.camera.uuid + "/" + event.timestamp + "/thumb.jpeg";

		// And print out the url and other relevant info
		console.log("(" + i + ") URL: " + frameUri + "\n Object ID: " + event.objectID + "\n Timestamp: " + event.timestamp + "\n CameraUUID: " + event.camera.uuid);
		console.log("--------------------------------------");
		i++;
	}
}

/*
  *
  * @export
  * @method Prompts a user for which person they would like to follow in the program.
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  * @param {Camera[]} [cameras] The array of available cameras
  *
  * @return {Promise<RecentHumanEventInfo>} Returns a recent human event that will be used for the program.
  * */
export const PromptUser = async (configuration: Configuration, cameras: Camera[]): Promise<RecentHumanEventInfo> => {
	// Create an array where we will put our recent human events
	let recentHumanEvents: RecentHumanEventInfo[] = [];

	// The duration in seconds in the past to look for recent human events
	const duration = Environment.SuggestedHumanEventSecondsSinceCurrentTime;

	// The starting time in seconds (hence the /1000) since epoch where we will start looking for human events
	const currentTime = Math.round(new Date().getTime() / 1000) - duration;

	// Loop through all of the cameras
	for (const cam of cameras) {
		// Get a list of human events
		const humanEvents = await GetHumanEvents(configuration, cam, currentTime, duration)

		// Collate and isolate the events from length
		const collatedEvents = IsolateEventsFromLength(humanEvents);

		// Loop through each of the collated events
		collatedEvents.forEach((es) => {
			// We only really care about the first of those human event arrays
			const event = es[0];

			// Add the recent human event to our array
			recentHumanEvents.push({
				timestamp: event.timestamp,
				objectID: event.id,
				camera: event.camera,
			});
		});
	}

	// Now we are going to print that information to the user
	await PrintRecentHumanEvents(configuration, recentHumanEvents, cameras);

	// If there are any recent human events, we will ask the user to choose one from the printed events.
	// Otherwise if there aren't any human events then we will just set our selection as -1, meaning that we want to manually specify.
	const autoSelectResponse = recentHumanEvents.length == 0 ? { selection: -1 } : await prompts({
		type: "number",
		name: "selection",
		message: "Please select a human event to follow. You can either use one of the events in the last 10 minutes OR you can type -1 to specify manually a custom objectID, timestamp, and camera.",
	});

	// If the selection is -1 or the user specified an invalid selection, then we want to manually select a human event
	if (autoSelectResponse.selection < 0 || autoSelectResponse.selection >= recentHumanEvents.length) {
		// Prompt the user for the the person they want
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

		// Wait for their response
		const response = await prompts(manualSelectQuestions);

		// Find the camera that they specified
		const camera = cameras.find((element) => element.uuid == response.cameraUUID);

		// If there is no camera then we should return.
		if (camera == undefined) {
			console.log("Camera UUID not found!");
			return;
		}

		// Return the event info specified by the user
		return {
			objectID: response.objectID,
			camera: camera,
			timestamp: response.timestamp
		};
	} else {
		// Return the event info from our selection
		return recentHumanEvents[autoSelectResponse.selection];
	}

}
