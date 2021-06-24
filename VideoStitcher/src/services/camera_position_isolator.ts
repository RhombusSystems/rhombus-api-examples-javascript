import { Camera } from "../types/camera"
import { Vec2 } from "../types/vector"
import { ExitEvent } from "../types/events"
import { NormalizeVelocity, NormalizePosition } from "./velocity_isolator"
import { GetCameraPlot, CameraPlot } from "./graph_service"

export const IsolateCameras = (cameras: Camera[], event: ExitEvent): Camera[] => {
	let validCameras: Camera[] = []
	const velocity = NormalizeVelocity(event.velocity, { x: 0.01 / 1000, y: 0.01 / 1000 });
	const origin: Camera = cameras.find(element => element.uuid == event.events[0].camUUID);
	if (origin == undefined) return;

	for (const cam of cameras) {
		if (cam.uuid == event.events[0].camUUID) continue;
		const plot = GetCameraPlot(cam, origin);
		const threshold = { x: 0.5, y: 0.5 };
		let position = NormalizePosition(plot.position, threshold);
		if (velocity.x - position.x != 0 && velocity.y - position.y != 0) {
			position = NormalizePosition({ x: plot.x[0] + plot.x[2], y: plot.y[0] + plot.y[2] }, threshold)
			if (velocity.x - position.x != 0 && velocity.y - position.y != 0) {
				console.log("Camera not valid for exit event! " + cam.uuid);
			} else {
				validCameras.push(cam);
			}
		} else {
			validCameras.push(cam);
		}
	}

	return validCameras;
}
