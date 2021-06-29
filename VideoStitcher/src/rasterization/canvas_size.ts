import { Camera } from "../types/camera"
import { Vec2 } from "../types/vector"
import { GetCameraPlot, CameraPlot } from "../services/graph_service"

export const GetCanvasSize = (cameras: Camera[], originCamera: Camera): Vec2 => {
	let extremeX = 0;
	let extremeY = 0;

	for (const camera of cameras) {
		if (isNaN(camera.rotationRadians)) continue;
		const plot = GetCameraPlot(camera, originCamera);
		for (const x of plot.x) {
			if (Math.abs(x) > Math.abs(extremeX)) {
				extremeX = x;
			}

		}
		for (const y of plot.y) {
			if (Math.abs(y) > Math.abs(extremeY)) {
				extremeY = y;
			}
		}
	}
	const width = Math.abs(extremeX) * 2;
	const height = Math.abs(extremeY) * 2;
	if (width >= height) {
		return {
			x: width,
			y: width,
		};
	} else {
		return {
			x: height,
			y: height,
		};
	}
}
