import { HumanEvent } from "../types/human_event"
import { ExitEvent, EnterEvent, FinalizedEvent } from "../types/events"
import { Camera } from "../types/camera"
import { IOServer } from "../server/server"
import { Vec2 } from "../types/vector"
import { GeodeticToENUSimpleApproximation } from "../utils/utils"
import { Rotate, Apply } from "../types/matrix"
import { NormalizeAngle } from "../utils/math"
import { GetCanvasSize } from "../rasterization/canvas_size"
import { RasterizeCameras, RasterizeVelocity } from "../rasterization/rasterizer"

export interface PlotGraphMessage {
	event: FinalizedEvent;
	id: number;
};

export interface CameraPlot {
	x: number[];
	y: number[];
	position: Vec2;
	rotation: number;
	uuid: string;
};

export interface PlotCamerasMessage {
	cameras: CameraPlot[];
};




export const SendGraph = (msg: PlotGraphMessage) => {
	if (!msg) return;
	IOServer.Emit("Plot-Graph", msg);
}

const GetCameraSideRadius = (angle: number, cameraDistance: number) => {
	return cameraDistance / Math.cos(angle);
}


export const GetCameraPlot = (camera: Camera, origin: Camera): CameraPlot => {
	const rot = camera.rotationRadians;
	const fov = camera.FOV;
	const cameraSideRadius = GetCameraSideRadius(fov / 2, camera.viewDistance);
	const offset = GeodeticToENUSimpleApproximation(camera.location, origin.location);
	let positions: Vec2[] = [
		{
			x: cameraSideRadius * Math.cos(rot + fov / 2) + offset.x,
			y: cameraSideRadius * Math.sin(rot + fov / 2) + offset.y
		},
		{
			x: offset.x,
			y: offset.y,
		},
		{
			x: cameraSideRadius * Math.cos(rot - fov / 2) + offset.x,
			y: cameraSideRadius * Math.sin(rot - fov / 2) + offset.y,
		},
	]
	const rotationRadians = NormalizeAngle(Math.PI / 2 - origin.rotationRadians);
	const rotation = Rotate(rotationRadians);
	positions = positions.map(pos => Apply(rotation, pos));
	return {
		x: positions.map((pos) => pos.x),
		y: positions.map((pos) => pos.y),
		uuid: camera.uuid,
		rotation: rotationRadians + rot,
		position: positions[1],
	};
}

export const SendCameraPlot = (cameras: Camera[], event: ExitEvent) => {
	if (!event) return;
	cameras.forEach((cam) => {
		if (cam.uuid == event.events[0].camera.uuid) {
			const plots = cameras.map(camera => GetCameraPlot(camera, cam));
			const canvasSize = GetCanvasSize(cameras, cam);
			const screen = RasterizeCameras(plots.filter(camera => camera.uuid != cam.uuid), 1, canvasSize.x);
			const netScreen = RasterizeVelocity(event, 300, screen);
			IOServer.Emit("Plot-Cameras", { cameras: plots, screen: screen, netScreen: netScreen });
		}
	});
}
