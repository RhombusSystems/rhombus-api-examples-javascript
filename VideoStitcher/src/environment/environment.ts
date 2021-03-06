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

export namespace Environment {
	// The distance from the edge that should be considered for edge events from 0-1
	export const EdgeEventDetectionDistanceFromEdge: number = Number(process.env.EDGE_EVENT_DETECTION_DISTANCE_FROM_EDGE || 0.4);

	// How long before the current time should the prompter suggest human events
	export const SuggestedHumanEventSecondsSinceCurrentTime: number = Number(process.env.SUGGESTED_HUMAN_EVENT_SECONDS_SINCE_CURRENT_TIME || 600);

	// The minimum number of human events to even consider it a full exit or enter event
	export const MinimumEventLength: number = Number(process.env.MINIMUM_EVENT_LENGTH || 2);

	// The capture radius when isolating cameras based on velocity of a person and camera location in meters
	export const CaptureRadiusMeters: number = Number(process.env.CAPTURE_RADIUS_METERS || 300);

	// How long from the starting time to look for exit events in seconds
	export const ExitEventDetectionDurationSeconds: number = Number(process.env.EXIT_EVENT_DETECTION_DURATION_SECONDS || 10 * 60);

	// How long before the start time should the exit event detector start looking. It is recommended that this be greater than 0 so that events don't accidentally get missed
	export const ExitEventDetectionOffsetSeconds: number = Number(process.env.EXIT_EVENT_DETECTION_OFFSET_SECONDS || 0.5 * 60);

	// How long from the end of a one exit event should the related event detector look for other events
	export const RelatedEventDetectionDurationSeconds: number = Number(process.env.RELATED_EVENT_DETECTION_DURATION_SECONDS || 30);

	// The density of pixels to render per meter when rasterizing the cameras. A higher value will require more rasterization and thus processing power but will be more accurate. 
	// However this doesn't really matter so it is recommended that this value be pretty low because the accuracy really doesn't matter.
	export const PixelsPerMeter: number = Number(process.env.PIXELS_PER_METER || 10);

	// How much time in miliseconds should be added before the start of the first exit event when combining clips. This will allow some padding time. 
	// For example if the padding is 4 seconds, then 4 seconds of footage before the detected exit event should be added.
	// This is important in case someone might be like walking around in place before he leaves the camera's view, this might not be caught without the padding.
	export const ClipCombinationEdgePaddingMiliseconds: number = Number(process.env.CLIP_COMBINATION_EDGE_PADDING_MILISECONDS || 4000);

	// How much padding between each camera switch should be added in miliseconds.
	export const ClipCombinationPaddingMiliseconds: number = Number(process.env.CLIP_COMBINATION_PADDING_MILISECONDS || 1500);

	// In case the clip combiner fails, how many times should it retry to combine the clips.
	export const ClipCombinationRetryMax: number = Number(process.env.CLIP_COMBINATION_RETRY_MAX || 3);

}
