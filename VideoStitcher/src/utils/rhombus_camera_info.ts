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

import { FeetToMeters } from "./utils"
import { HardwareVariationEnum } from "@rhombus/API"
/*
  *
  * @export
  * @interface RhombusCameraSpecs
  * */
export interface RhombusCameraSpecs {
	/*
	  * @type {number} The field of view of the camera.
	  * @memberof RhombusCameraSpecs
	  * */
	FOV: number;

	/*
	  * @type {number} The view distance of humans in meters of the camera.
	  * @memberof RhombusCameraSpecs
	  * */
	viewDistance: number;
};

/*
  *
  * @export
  * @method Gets the camera spec information for a specific model
  *
  * @param {HardwareVariationEnum} [cameraHW] The camera hardware model
  *
  * @return {RhombusCameraSpecs} Returns the hardware specs of the camera
  * */
export const GetCameraSpecs = (cameraHW: HardwareVariationEnum): RhombusCameraSpecs => {
	switch (cameraHW) {
		case HardwareVariationEnum.CAMERAR100:
			return {
				FOV: 96,
				viewDistance: FeetToMeters(57)
			};
		case HardwareVariationEnum.CAMERAR1:
			return {
				FOV: 135,
				viewDistance: FeetToMeters(44)
			};
		case HardwareVariationEnum.CAMERAR2:
			return {
				FOV: 96,
				viewDistance: FeetToMeters(57)
			};
		case HardwareVariationEnum.CAMERAR200:
			return {
				FOV: 112,
				viewDistance: FeetToMeters(57)
			};
		default:
			// Print in red
			console.log("\x1b[31m%s\x1b[0m", "Running unsupported camera! Using default FOV and view distance settings!");
			return {
				FOV: 112,
				viewDistance: FeetToMeters(57)
			};
	}
}
