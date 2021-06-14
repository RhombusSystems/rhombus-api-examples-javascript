/*
  *
  * @import fs to delete resource directories with our clips and frames
  * */
import * as fs from "fs";

/*
  *
  * @export
  * @method Delete res/<timestamp> directory containing clips and frames that were processed
  *
  * @param {string}[directory] Path of directory to delete, should be just res/<timestamp> where <timestamp> is the startTime in miliseconds since epoch 
  * */
export const Cleanup = (directory: string) => {
	// If provided directory path exists and it is actually a directory that is provided
	if (fs.existsSync(directory) && fs.lstatSync(directory).isDirectory()) {

		// Loop through all of the files in the directory
		fs.readdirSync(directory).forEach(file => {
			// Delete the file
			fs.unlinkSync(directory + "/" + file);
		});

		// Remove the directory itself
		fs.rmdirSync(directory);
	}
}
