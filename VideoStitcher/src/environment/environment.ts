export namespace Environment {
	export const MinimumEventLength: number = Number(process.env.MINIMUM_EVENT_LENGTH) || 2;
	export const ObjectIDMaxLengthSeconds: number = Number(process.env.MAXIMUM_OBJECT_ID_DURATION_SECONDS) || 10;
	export const CaptureRadiusMeters: number = Number(process.env.CAPTURE_RADIUS_METERS) || 300;
}
