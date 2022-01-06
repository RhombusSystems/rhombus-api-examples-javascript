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
  * @import XML parser so that we can parse the MPD document
  * */
import { XMLParser } from "fast-xml-parser";

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
  * @interface RhombusMPDInfo
  *
  * */
export interface RhombusMPDInfo {
	/*
	  * @type {string} The pattern containing "$Number$" which can be replaced with an index that is incremented for each segment.
	  * @memberof RhombusMPDInfo
	  * */
	segPattern: string;

	/*
	  * @type {string} The string which is appended to the end of the mpd URI to get the start mp4 file.
	  * @memberof RhombusMPDInfo
	  * */
	segInitStr: string;

	/*
	  * @type {number} The starting index which will be incremented for each segment.
	  * @memberof RhombusMPDInfo
	  * */
	startIndex: number;
}

/*
  *
  * @export 
  * @method Parse relevant information from a raw MPD XML string.
  *
  * @param {string} [mpdDocRaw] the raw XML string that is retrieved from downloading the mpd document from a Rhombus URI.
  * @return {RhombusMPDInfo} the info relevant to downloading from MPD stream.
  * */
export const parseRhombusMPD = (mpdDocRaw: string): RhombusMPDInfo => {
	const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
	const mpdDoc = parser.parse(mpdDocRaw);

	const segmentTemplate = mpdDoc.MPD.Period.AdaptationSet.SegmentTemplate;

	return {
		segPattern: segmentTemplate.media,
		segInitStr: segmentTemplate.initialization,
		startIndex: parseInt(segmentTemplate.startNumber),
	};
}

/*
  *
  * @export 
  * @method Save an m4v or mp4 url to the specified output file
  *
  * @param {number} [index] the segment index starting at 0.
  * @param {string} [mpdUri] the MPD URI with the correct start and end times. This should have a file.mpd or clip.mpd ending.
  * @param {RhombusMPDInfo} [rhombusInfo] the MPD info parsed using `parseRhombusMPD(string)`.
  * @param {string} [mpdName] either "file.mpd" or "clip.mpd", depending on if you are using WAN or LAN.
  * */
export const getSegmentURI = (index: number, mpdUri: string, rhombusInfo: RhombusMPDInfo, mpdName: string): string => {
	const replacement = rhombusInfo.segPattern.replace("$Number$", (index + rhombusInfo.startIndex).toString());
	return mpdUri.replace(mpdName, replacement);
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
export const FetchVOD = async (config: Configuration, federatedToken: string, uri: string, type: ConnectionType, duration: number = 20): Promise<FetchVODResult> => {

	// Get the starting time in seconds. This will be the current time in miliseconds since epoch / 1000 - duration
	const startTime = Math.round(new Date().getTime() / 1000) - duration;

	// We need to replace {START_TIME} and {DURATION} with the correct values in order to properly download the file
	let fullURI = uri.replace("{START_TIME}", startTime.toString()).replace("{DURATION}", duration.toString());

	// These headers are necessary for almost all Rhombus requests, URL or API regardless
	axios.defaults.headers.common['x-auth-apikey'] = config.apiKey;
	axios.defaults.headers.common['x-auth-scheme'] = 'api-token';
	axios.defaults.headers.common['Accept'] = 'application/json';
	axios.defaults.headers.common['Content-Type'] = 'application/json';

	// The federated token is set as a cookie. Without this we would be unable to download the files from Rhombus
	axios.defaults.headers.common['Cookie'] = 'RSESSIONID=RFT:' + federatedToken;

	// Get the Rhombus MPD Doc info.
	const mpdDocRaw = await axios.get(fullURI, { responseType: "json" });
	const rhombusInfo = parseRhombusMPD(mpdDocRaw.data);

	// The directory where we will place our clip is "<PROJECT_ROOT>/res/<startTime>"
	const dir = "./res/" + startTime + "/";

	// If the directory does not already exist, then we need to create it
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir, { recursive: true });

	// The path of the clip is dir/clip.mp4 regardless of timestamp. The file is always called clip.mp4
	const path = dir + "clip.mp4";

	// This will change depend on whether we are using WAN or LAN
	const mpdName = type == ConnectionType.LAN ? "clip.mpd" : "file.mpd";

	// Because our URI is an mpd, we need to get each of the segments. The seg_init.mp4 is the first of these. 
	// Just replace clip.mpd at the end of the URL with seg_init.mp4 
	// This also needs to be written since this is the first of our segments
	await saveClip(path, fullURI.replace(mpdName, rhombusInfo.segInitStr), true);

	// Each of the segments is 2 seconds long, so the number of segments is duration/2
	for (let i = 0; i < duration / 2; i++) {
		// The URI of all subsequent segments will replace clip.mpd with seg_<index>.m4v
		// These files will need to be appended to our existing clip.mp4 in disk
		await saveClip(path, getSegmentURI(i, fullURI, rhombusInfo, mpdName));
	}

	// Return our data
	return {
		clipPath: path,
		directoryPath: dir,
		timestamp: startTime,
	};
}
