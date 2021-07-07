export namespace Environment {
	export const MinimumEventLength: number = Number(process.env.MINIMUM_EVENT_LENGTH || 2);
	export const ObjectIDMaxLengthSeconds: number = Number(process.env.MAXIMUM_OBJECT_ID_DURATION_SECONDS || 10);
	export const CaptureRadiusMeters: number = Number(process.env.CAPTURE_RADIUS_METERS || 300);
	export const ExitEventDetectionDurationSeconds: number = Number(process.env.EXIT_EVENT_DETECTION_DURATION_SECONDS || 10 * 60);
	export const ExitEventDetectionOffsetSeconds: number = Number(process.env.EXIT_EVENT_DETECTION_OFFSET_SECONDS || 0.5 * 60);
	export const RelatedEventDetectionDurationSeconds: number = Number(process.env.RELATED_EVENT_DETECTION_DURATION_SECONDS || 30);
	export const ClipCombinationEdgePaddingMiliseconds: number = Number(process.env.CLIP_COMBINATION_EDGE_PADDING_MILISECONDS || 4000);
	export const ClipCombinationPaddingMiliseconds: number = Number(process.env.CLIP_COMBINATION_PADDING_MILISECONDS || 1500);
	export const ClipCombinationRetryMax: number = Number(process.env.CLIP_COMBINATION_RETRY_MAX || 3);
	export const PixelsPerMeter: number = Number(process.env.PIXELS_PER_METER || 10);
	export const SuggestedHumanEventSecondsSinceCurrentTime: number = Number(process.env.SUGGESTED_HUMAN_EVENT_SECONDS_SINCE_CURRENT_TIME || 600);

}
