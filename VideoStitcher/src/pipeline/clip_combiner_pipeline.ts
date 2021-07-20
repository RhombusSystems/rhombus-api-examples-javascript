import { FinalizedEvent } from "../types/events"
import { FetchVOD } from "../services/vod_fetcher"
import { FetchMediaURIs } from "../services/media_uri_fetcher"

import { Configuration } from "@rhombus/API"

import { ConnectionType } from "../types/connection_type"

import { Environment } from "../environment/environment"

/*
  *
  * @import We are going to call FFMpeg to generate our frame JPEGs, so we will need both ffmpeg and the child process to execute our commands
  * */
import * as pathToFFMpeg from "ffmpeg-static"
import { exec } from 'child_process'

import * as fs from "fs";

/*
  *
  * @import We also will import util so that we can use exec as an async/await function
  * */
import * as util from "util"
const run = util.promisify(exec);

/*
  *
  * @export
  * @method Downloads finalized events
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  * @param {ConnectionType} [type] Whether to use LAN or WAN for the connection, by default LAN and unless you are on a different connection, you should really just use LAN
  * @param {FinalizedEvent} [event] The event to download the VOD from
  * @param {string} [dir] The directory to output the VOD
  * @param {number} [index] The recursive download index. When this function calls itself it will increase this value, you shouldn't really ever set this manually when calling the function.
  * */
export const DownloadFinalizedEventRecursive = async (configuration: Configuration, type: ConnectionType, event: FinalizedEvent, dir: string, index: number = 0): Promise<void> => {
	// We are going to get our start time in seconds (thus divided by 1000) and then we will add a bit of padding to make sure we really download the full clip.
	// If the index is 0 (meaning our first clip) we will add a larger padding than the rest because oftentimes the exit event might not include some of the earlier events
	const startTime = Math.floor(event.startTime / 1000 - (index == 0 ? Environment.ClipCombinationEdgePaddingMiliseconds / 1000 : Environment.ClipCombinationPaddingMiliseconds / 1000));

	// For the end time we will do the same thing. The end time has padding as well.
	const endTime = Math.ceil(event.endTime / 1000 + (event.followingEvent == undefined ? Environment.ClipCombinationEdgePaddingMiliseconds / 1000 : Environment.ClipCombinationPaddingMiliseconds / 1000));

	// Get the camera UUID
	const camUUID = event.data[0].camera.uuid;

	// Fetch the media URIs using our type
	const uri_res = await FetchMediaURIs(configuration, camUUID, 60, type);

	// Download the VOD. It will be stored in a file "<dir>/<index>.mp4"
	await FetchVOD(configuration, uri_res.federatedToken, uri_res.uri, type, dir, index.toString() + ".mp4", startTime, endTime);

	// The vidlist.txt is created for ffmpeg. It will contain a list of mp4 files which will be combined.
	const vidlist = dir + "vidlist.txt";

	// The mp4 VOD that we download will need to be added to the vidlist.txt
	const data = "file '" + index.toString() + ".mp4'\n";

	// If this is the first download, then we should write to the file instead of append
	if (index == 0) {
		fs.writeFileSync(vidlist, data);
	} else {
		fs.appendFileSync(vidlist, data)
	}

	// If there is another following event, then we will do our recursion, otherwise we'll just end
	if (event.followingEvent != undefined) {
		// We will increase our index by 1 when calling this method and pass in our event.followingEvent as the event
		return DownloadFinalizedEventRecursive(configuration, type, event.followingEvent, dir, ++index);
	}
}

/*
  *
  * @export
  * @method Downloads a finalized event chain and then combines the downloaded clips into one stitched video
  *
  * @param {Configuration} [config] The API configuration to use when making API requests
  * @param {ConnectionType} [type] Whether to use LAN or WAN for the connection, by default LAN and unless you are on a different connection, you should really just use LAN
  * @param {FinalizedEvent} [event] The event to download the VOD from
  * @param {number} [retryIndex] The number of times retried to download
  * */
export const ClipCombinerPipeline = async (config: Configuration, type: ConnectionType, event: FinalizedEvent, retryIndex: number = 0): Promise<void> => {
	// The output directory will be "res/<start_time_in_miliseconds/"
	let dir = "res/" + event.startTime + "/";

	// If the directory already exists, then we shouldn't download it again
	if (fs.existsSync(dir)) {
		console.log("Already downloaded this clip, not downloading again!")
		return;
	}

	// Make the directory (since we already check to make sure it doesn't already exist, we can just do this)
	fs.mkdirSync(dir);

	// Download the VOD
	await DownloadFinalizedEventRecursive(config, type, event, dir)

	try {
		// Run the FFMpeg command to combine the downloaded mp4s based on the vidlist.txt
		await run(pathToFFMpeg + " -f concat -safe 0 -i " + dir + "vidlist.txt -c copy " + dir + "output.mp4");
	} catch (e) {
		if (retryIndex >= Environment.ClipCombinationRetryMax - 1) {
			console.log("Something went wrong, failed to combine mp4 clips! Ouput directory " + dir);
			return;
		} else {
			// There is something wrong here, I'm not entirely sure what and it seems to be FFMpeg related. This try catch is here to try the entire process again if it fails.
			console.log("Something went wrong, trying to combine the clips again!");

			// Remove the old directory
			fs.rmdirSync(dir, { recursive: true });

			// And try again...
			return ClipCombinerPipeline(config, type, event, ++retryIndex);
		}
	}

	console.log("Output stitched video in directory " + dir);
}
