/*
  *
  * @import ActivityEnum and FootageBoundingBoxType for returning the final request generated in `ClassifyDirectory`
  * */
import { ActivityEnum, FootageBoundingBoxType } from "@rhombus/API"

/*
  *
  * @import Vec2 so that for bounding box position and dimensions
  * */
import { Vec2 } from "../types/vector";

/*
  *
  * @import node and ObjectDetection from tensorflow to do object detection with the coco model
  * */
import { node } from '@tensorflow/tfjs-node';
import { ObjectDetection } from "@tensorflow-models/coco-ssd"

/*
  *
  * @import fs to read our jpg files from the res directory
  * */
import * as fs from "fs";

/*
  * 
  * @import util to promisify fs.readFile
  * */
import * as util from "util"
const readFile = util.promisify(fs.readFile);

/*
  *
  * @import image-size for getting the dimensions of the video frame when sending the permyriads
  * */
import imageSize from "image-size"

/*
  *
  * @export
  * @interface Data for bounding boxes
  * */
export interface BoundingBox {
	/*
	  * @type {string} Label for this box, for example "cat", "table", "human", etc...
	  * @memberof BoundingBox
	  * */
	label: string;
	/*
	  *
	  * @type {Vec2} Position of the bounding box
	  * @memberof BoundingBox
	  * */
	position: Vec2;
	/*
	  *
	  * @type {Vec2} Dimensions of the bounding box
	  * @memberof BoundingBox
	  * */
	dimensions: Vec2;

	/*
	  *
	  * @type {number} The timestamp in ms of where to put the bounding box
	  * @memberof BoundingBox
	  * */
	timestamp: number;
};

/*
  *
  * @export
  * @method Classify a specific JPEG image from a given filePath
  *
  * @param {ObjectDetection} [model] The coco model that is initialized in `main`
  * @param {string} [filePath] The path of the JPEG image to classify
  * @param {number} [timestamp] The timestamp in ms at which this JPEG appears
  *
  * @return {Promise<[BoundingBox[], Vec2]} Returns the array of bounding boxes found in the JPEG and the dimensions (width and height) of the JPEG
  * */
export const ClassifyImage = async (model: ObjectDetection, filePath: string, timestamp: number): Promise<[BoundingBox[], Vec2]> => {
	// Read the JPEG from disk
	const buffer = await readFile(filePath);

	// Convert the buffer of our JPEG to a tensor
	const img: any = node.decodeImage(buffer);

	// Get all of the objects in the image
	const predictions = await model.detect(img);

	// Convert all of the boxes found in the tensor detection to BoundingBoxes
	let boxes: BoundingBox[] = [];
	for (let i = 0; i < predictions.length; i++) {

		// Get the prediction data
		const prediction = predictions[i].bbox;

		// Set the data
		boxes.push({
			label: predictions[i].class,
			position: { x: prediction[0], y: prediction[1] },
			dimensions: { x: prediction[2], y: prediction[3] },
			// We round the timestamp because we only really care about miliseconds
			timestamp: Math.round(timestamp),
		});
	}

	// Save the dimensions of the JPEG
	const dimensions = imageSize(buffer);

	// Return our data
	return [boxes, { x: dimensions.width, y: dimensions.height }];
}

/*
  *
  * @export
  * @method Classify all frames in the directory. This will just classify every single non mp4 in the directory, but this is fine
  *
  * @param {ObjectDetection} [model] the coco-ssd model that is created in `main`
  * @param {string} [directory] The directory containing the clip.mp4 and frame JPEGs to process. This is normally "res/<TIMESTAMP_SECONDS>/"
  * @param {number} [startTime] The start time in seconds of our clip.mp4
  * @param {number} [duration] The duration in seconds of our clip
  *
  * @return {Promise<FootageBoundingBoxType[]>} Returns the array of FootageBoundingBoxType which we can then just send to Rhombus to create the bounding boxes on the console
  * */
export const ClassifyDirectory = async (model: ObjectDetection, directory: string, startTime: number, duration: number): Promise<FootageBoundingBoxType[]> => {
	// Get all of the files in our resource directory
	let files = fs.readdirSync(directory, { withFileTypes: true });

	// If the file is not a JPEG, then we don't want to include it in later processing
	files = files.filter(file => file.name.search("jpg") != -1);

	// We need to sort our JPEGs alphabetically, so that we make sure they are in order
	files.sort((a, b) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	});

	// Create our array of bounding boxes which will then later be processed
	let boxes: BoundingBox[] = [];

	// The dimensions of our JPEG. This should theoretically remain constant between every single frame, but we will set it for every frame just in case
	let dimensions: Vec2;

	// Loop through all of our files
	for (let i = 0; i < files.length; i++) {
		// Get the timestamp of our frame, which will be the startTime in seconds + some offset
		// The offset will just be the index / the number of files * our duration, that way we can see what fraction of the way we are through our clip just by looking at the index
		// We also will multiply everything by 1000 since the timestamp has to be in ms, and right now we are in seconds
		const timestamp = (startTime + (i / files.length) * duration) * 1000;

		// Classify our image
		const [res, dim] = await ClassifyImage(model, directory + files[i].name, timestamp)

		// Add those new results to our boxes
		boxes = boxes.concat(res);

		// Update the dimensions of our JPEG just in case
		dimensions = dim;
	}

	// Create our final array of boxes
	let boundingBoxes: FootageBoundingBoxType[] = [];

	// Loop through all of our own boxes and convert them to FootageBoundingBoxTypes
	for (let i = 0; i < boxes.length; i++) {
		const box = boxes[i];

		// We are using the top left as the bounding box position, so top left is (box.x, box.y), bottom right is (box.x + box.width, box.y + box.height)
		boundingBoxes.push({
			a: ActivityEnum.CUSTOM,
			// These values are permyriads, so we need to convert our bounding boxes appropriately
			b: (box.position.y + box.dimensions.y) / dimensions.y * 10000, // Bottom
			l: (box.position.x / dimensions.x) * 10000, // Left
			r: ((box.position.x + box.dimensions.x) / dimensions.x) * 10000, // Right
			t: (box.position.y / dimensions.y) * 10000, // Top
			ts: box.timestamp,
			cdn: box.label,
		});
	}

	for (let i = 0; i < boundingBoxes.length; i++) {
		console.log("Found object " + boundingBoxes[i].cdn)
	}

	// Return those boxes
	return boundingBoxes;
}
