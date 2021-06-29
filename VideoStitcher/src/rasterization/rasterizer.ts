import { Vec2 } from "../types/vector"
import { CameraPlot } from "../services/graph_service"
import { TriangleFromCameraPlot, PointInsideTriangle } from "./triangle"

export interface Pixel {
	cameras: string[];
};

export interface Screen {
	pixels: Pixel[][];
	dimensions: number;
	pixelSize: number;
	offset: number;
};

export const RasterizeCameras = (cameras: CameraPlot[], pixelsPerMeter: number, meterSpan: number): Screen => {
	const screenSize = Math.ceil(pixelsPerMeter * meterSpan);
	const pixelSize = 1 / pixelsPerMeter;
	const offset = meterSpan / 2;

	let pixels: Pixel[][] = [];

	for (const camera of cameras) {
		const triangle = TriangleFromCameraPlot(camera, offset);

		for (let row = 0; row < screenSize; row++) {
			for (let column = 0; column < screenSize; column++) {
				if (pixels[row] == undefined) {
					pixels[row] = [];
					for (let i = 0; i < screenSize; i++) {
						pixels[row].push({ cameras: [] });
					}
				}
				const position: Vec2 = {
					x: column * pixelSize,
					y: row * pixelSize,
				};
				const inside = PointInsideTriangle(triangle, position);
				if (inside) {
					pixels[row][column].cameras.push(camera.uuid);
				}
			}
		}
	}
	return {
		pixels: pixels,
		dimensions: meterSpan,
		pixelSize: pixelSize,
		offset: offset,
	};

}

