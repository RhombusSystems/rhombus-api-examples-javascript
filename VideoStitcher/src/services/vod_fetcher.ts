/*
  *
  * @import Import Configuration with our API key
  * */
import { Configuration } from "@rhombus/API"

/*
  *
  * @import Connection URI Type for picking out the correct URI
  * */
import { ConnectionType } from "../types/connection_type"


/*
  *
  * @import Import axios to download the vod
  * */
const axios = require('axios').default;

/*
  *
  * @import Import filesystem so that we can save our mp4 to a file
  * */
import * as fs from "fs";

/*
  *
  * @export
  * @interface Result after calling `FetchVOD`
  * */
export interface FetchVODResult {
	/*
	  * 
	  * @type {string} The path of the clip mp4
	  * @memberof FetchVODResult
	  * */
	clipPath: string;

	/*
	  *
	  * @type {string} The path where our mp4 clip is stored. This will make it easy for us to store other assets like frames in the same directory
	  * @memberof FetchVODResult
	  * */
	directoryPath: string;

	/*
	  * 
	  * @type {number} The startTime timestamp in seconds since epoch of our clip
	  * @memberof FetchVODResult
	  * */
	timestamp: number;
};

/*
  *
  * @export 
  * @method Save an m4v or mp4 url to the specified output file
  *
  * @param {string} [path] the path of the output file
  * @param {string} [uri] the url from which to download
  * @param {boolean} [write] whether or not to write the file or append it to an existing file, by default it is false which is append
  * */
export const saveClip = async (path: string, uri: string, write: boolean = false) => {
	console.log("Saving clip " + uri);

	// Download the file from the uri
	const response = await axios.get(uri, { responseType: 'arraybuffer' })

	// Get the buffer
	const buffer = Buffer.from(response.data, "utf-8");

	// If we should write vs append to an existing file
	if (write) {
		// If the path already exists and we need to write, then delete the existing file
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
		}

		// Write the file
		fs.writeFileSync(path, buffer)
	} else {
		// Append the buffer to the existing file
		fs.appendFileSync(path, buffer);
	}
}

/*
  *
  * @export 
  * @method Download a vod to disk. It will be saved in res/<current time in seconds>
  *
  * @param {Configuration} [config] the configuration with our API token
  * @param {string} [federatedToken] the federated token which will be used to download the files. Without this we would get a 401 authentication error
  * @param {string} [uri] the VOD uri to download from
  * @param {string} [duration] the duration in seconds of the clip to download
  *
  * @return {Promise<FetchVODResult>} Returns the path of the downloaded vod mp4 and the directory in which that downloaded mp4 is in. 
  * 				      It will also return the timestamp in seconds since epoch of the startTime of the clip
  * */
export const FetchVOD = async (config: Configuration, federatedToken: string, uri: string, type: ConnectionType, dir: string, fileName: string, startTime: number, endTime: number): Promise<FetchVODResult> => {
	const duration = endTime - startTime + 1;

	// We need to replace {START_TIME} and {DURATION} with the correct values in order to properly download the file
	let fullURI = uri.replace("{START_TIME}", startTime.toString()).replace("{DURATION}", duration.toString());

	// These headers are necessary for almost all Rhombus requests, URL or API regardless
	axios.defaults.headers.common['x-auth-apikey'] = config.apiKey;
	axios.defaults.headers.common['x-auth-scheme'] = 'api-token';
	axios.defaults.headers.common['Accept'] = 'application/json';
	axios.defaults.headers.common['Content-Type'] = 'application/json';

	// The federated token is set as a cookie. Without this we would be unable to download the files from Rhombus
	axios.defaults.headers.common['Cookie'] = 'RSESSIONID=RFT:' + federatedToken;

	// The directory where we will place our clip is "<PROJECT_ROOT>/res/<startTime>"

	// If the directory does not already exist, then we need to create it
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir);

	// The path of the clip is dir/clip.mp4 regardless of timestamp. The file is always called clip.mp4
	const path = dir + fileName;

	// This will change depend on whether we are using WAN or LAN
	const mpdName = type == ConnectionType.LAN ? "clip.mpd" : "file.mpd";

	// Because our URI is an mpd, we need to get each of the segments. The seg_init.mp4 is the first of these. 
	// Just replace clip.mpd at the end of the URL with seg_init.mp4 
	// This also needs to be written since this is the first of our segments
	saveClip(path, fullURI.replace(mpdName, "seg_init.mp4"), true);

	// Each of the segments is 2 seconds long, so the number of segments is duration/2
	for (let i = 0; i < duration / 2; i++) {
		// The URI of all subsequent segments will replace clip.mpd with seg_<index>.m4v
		// These files will need to be appended to our existing clip.mp4 in disk
		await saveClip(path, fullURI.replace(mpdName, "seg_" + i + ".m4v"));
	}

	// Return our data
	return {
		clipPath: path,
		directoryPath: dir,
		timestamp: startTime,
	};
}
