/**********************************************************************************/
/* Copyright (c) 2021 Rhombus Systems 						  */
/* 										  */
/* Permission is hereby granted, free of charge, to any person obtaining a copy   */
/* of this software and associated documentation files (the "Software"), to deal  */
/* in the Software without restriction, including without limitation the rights   */
/* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      */
/* copies of the Software, and to permit persons to whom the Software is          */
/* furnished to do so, subject to the following conditions: 			  */
/* 										  */
/* The above copyright notice and this permission notice shall be included in all */
/* copies or substantial portions of the Software.  				  */
/* 										  */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     */
/* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       */
/* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    */
/* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         */
/* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  */
/* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  */
/* SOFTWARE. 									  */
/**********************************************************************************/

/*
  *
  * @import necessary services
  * */
import { FetchMediaURIs } from "./services/media_uri_fetcher"
import { FetchVOD } from "./services/vod_fetcher"
import { GenerateFrames } from "./services/frame_generator"
import { ClassifyDirectory } from "./services/classifier"
import { RhombusFinalizer } from "./services/rhombus_finalizer"
import { Cleanup } from "./services/cleanup"

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

/*
  *
  * @import Tensorflow coco model and load function
  * */
import { load, ObjectDetection } from "@tensorflow-models/coco-ssd"

/*
  *
  * @export
  * @method Executes the services that will download the clip, classify it, and upload the bounding boxes to Rhombus
  *
  * @param {Configuration} [configuration] Rhombus configuration with API key that is used for all API calls
  * @param {string} [camUUID] Contains the camera for which we will be doing real time processing
  * @param {number} [duration] The length of clips for which to retrieve at a time. This is by default 10 second clips retrieved every 10 seconds, however this can be modified in `main`
  * @param {ObjectDetection} [model] The object detection model initialized in main so that we don't have to keep recreating it
  * */
export const runDetector = async (configuration: Configuration, camUUID: string, duration: number, model: ObjectDetection, type: ConnectionType) => {

	console.log("Fetching URIs...");

	// Get the media URIs from rhombus for our camera, this is done every sequence so that we don't have to worry about federated tokens. 
	// These URIs stay the same, but this method will also create our federated tokens
	const res = await FetchMediaURIs(configuration, camUUID, duration, type);

	console.log("Downloading the VOD...");

	// Download the mp4 of the last [duration] seconds starting from Now - [duration] seconds ago
	const vodRes = await FetchVOD(configuration, res.federatedToken, res.uri, type, duration);

	console.log("Generating frames...");

	// Generate a bunch of frames from our downloaded mp4, these will be put in vodRes.directoryPath/FRAME.jpg and the number of them will depend on the FPS, which is set right now to 3
	await GenerateFrames(vodRes.clipPath, vodRes.directoryPath, 3);

	console.log("Classifying Images...");

	// Classify all of the frames generated in the vodRes.directoryPath
	const boxes = await ClassifyDirectory(model, vodRes.directoryPath, vodRes.timestamp, duration);

	console.log("Sending the data to Rhombus...");

	// Send all of our bounding boxes to rhombus
	await RhombusFinalizer(configuration, camUUID, boxes);

	console.log("Cleaning up!");

	// Remove the downloaded files, the mp4 and jpgs
	Cleanup(vodRes.directoryPath);
}


/*
  *
  * Entry point 
  * @param {string} [apiKey] sets the API key that will be used throughout the application
  *
  * */
export const main = async (apiKey: string, camUUID: string, type: ConnectionType) => {
	// Show a warning if running in WAN mode, because this is not recommended
	if (type == ConnectionType.WAN) {
		// Print in red
		console.log("\x1b[31m%s\x1b[0m", "Running in WAN mode! This is not recommended if it can be avoided");
	}

	// Create a `Configuration` which will use our API key, this config will be used in all further API calls
	const configuration = new Configuration({ apiKey: apiKey });

	console.log("Initializing tensorflow...")

	// Load the cocoSSD model
	const model = await load();

	// This will define in seconds how long of clips we will retrieve from our camera and how often. This is by default 10 second clips retrieved every 10 seconds
	const duration = 10;

	// Run our detector once so we don't have to wait for the set interval
	runDetector(configuration, camUUID, duration, model, type);

	// Fetch VOD clip every 10 seconds
	setInterval(async () => {
		// Run the detector every 10 seconds
		runDetector(configuration, camUUID, duration, model, type)

		// Since setInterval is in ms and our duration is in seconds, we need to multiply by 1000
	}, duration * 1000)
}
