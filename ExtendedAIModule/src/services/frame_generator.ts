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
  * @import We are going to call FFMpeg to generate our frame JPEGs, so we will need both ffmpeg and the child process to execute our commands
  * */
import * as pathToFFMpeg from "ffmpeg-static"
import { exec } from 'child_process'

/*
  *
  * @import We also will import util so that we can use exec as an async/await function
  * */
import * as util from "util"
const run = util.promisify(exec);

/*
  *
  * @export
  * @method Generate frames at specified FPS using downloaded mp4 clip in the clip's same directory
  *
  * @param {string} [clipPath] The path of our clip.mp4 which we will use
  * @param {string} [directoryPath] The path where the clip.mp4 lies which is normally in res/<current time in seconds>
  * @param {number} [FPS] Specifies how many frames to generate for our video
  * */
export const GenerateFrames = async (clipPath: string, directoryPath: string, FPS: number = 1.0) => {
	// All of the frame JPEGs will follow the naming scheme FRAME<index>.jpg where index starts at 1
	const frameName = "FRAME%4d.jpg"

	// Run the FFMpeg command, which looks something like ffmpeg -i res/<TIME_IN_SECONDS>/clip.mp4 -r 1.0 res/<TIME_IN_SECONDS>/FRAME%4d.jpg
	// where 1.0 is the FPS
	await run(pathToFFMpeg + " -i " + clipPath + " -r " + FPS + " " + directoryPath + frameName);
}
