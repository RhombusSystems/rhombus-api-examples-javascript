/*
  *
  * @import necessary services
  * */
import { SendGraph, PlotGraphMessage, SendCameraPlot } from "./services/graph_service"

import { DetectionPipeline } from "./pipeline/detection_pipeline"
import { RelatedEventsPipeline } from "./pipeline/related_events_pipeline"
import { RelatedEventsIsolatorPipeline } from "./pipeline/related_event_isolator_pipeline"
import { ClipCombinerPipeline } from "./pipeline/clip_combiner_pipeline"
import { ExitEvent } from "./types/events"

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

import { PromptUser } from "./services/prompt_user"




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

	// Get a list of available cameras
	const camList = await GetCameraList(configuration);

	// Start the dev tools server
	IOServer.StartServer();

	// Declare our array of exit events that will be shown to the devtools
	let res: ExitEvent[] = [];

	// Declare our plot graph message which will be shown to the devtools
	let msg: PlotGraphMessage = undefined;

	// Continuously send the info to the devtools
	setInterval(() => {
		SendGraph(msg);
		if (res.length > 0) {
			SendCameraPlot(camList, res[0]);
		}
	}, 3000);


	// Get the selected event
	const selectedEvent = await PromptUser(configuration, camList);

	// Check for error when getting user input
	if (selectedEvent == undefined) {
		console.log("Invalid input!");
		return;
	}

	res = await DetectionPipeline(configuration, selectedEvent.camera, selectedEvent.objectID, Math.floor(selectedEvent.timestamp / 1000));

	// If there are more than one exit event found, that means we can continue
	if (res.length > 0) {
		// Look for related events
		const events = await RelatedEventsPipeline(configuration, res, camList);

		// Then isolate those related events
		const relatedEventsRes = RelatedEventsIsolatorPipeline(events);

		// Update the message for the devtools
		msg = relatedEventsRes.msg;

		// If there were any finalized events found
		if (relatedEventsRes.events.length > 0) {

			// Loop through them
			for (const event of relatedEventsRes.events) {

				// Final check to make sure there is at least one related event attached
				if (event.followingEvent != undefined) {

					// Then combine the clips
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
