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
