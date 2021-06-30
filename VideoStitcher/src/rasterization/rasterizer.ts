import { Vec2 } from "../types/vector"
import { GetCameraPlot, CameraPlot } from "../services/graph_service"
import { Camera } from "../types/camera"
import { TriangleFromCameraPlot, PointInsideTriangle } from "./triangle"
import { ExitEvent } from "../types/events"
import { NormalizeVelocity } from "../services/velocity_isolator"
import { Rotate, Apply } from "../types/matrix"
import { LeftOfLine } from "./triangle"
import { GetCanvasSize } from "./canvas_size"

export interface Pixel {
	cameras: string[];
};

export interface Screen {
	pixels: Pixel[][];
	meterSpan: number;
	screenSize: number;
	pixelSize: number;
	offset: number;
};

export interface CaptureNetScreen {
	pixels: boolean[][];
	meterSpan: number;
	screenSize: number;
	pixelSize: number;
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
		meterSpan: meterSpan,
		pixelSize: pixelSize,
		screenSize: screenSize,
		offset: offset,
	};

}

export interface CaptureNetTrapezoid {
	p0: Vec2;
	p1: Vec2;
	p2: Vec2;
	p3: Vec2;
};

export const NewCaptureNet = (captureRadius: number, meterSpan: number): CaptureNetTrapezoid => {
	return {
		p0: { x: meterSpan, y: -0.5 - (captureRadius - 1) / 2 },
		p1: { x: meterSpan, y: 0.5 + (captureRadius - 1) / 2 },
		p2: { x: 0, y: 0.5 },
		p3: { x: 0, y: -0.5 },
	};
}

export const OffsetCaptureNet = (captureNet: CaptureNetTrapezoid, offset: number): CaptureNetTrapezoid => {
	return {
		p0: { x: captureNet.p0.x + offset, y: captureNet.p0.y + offset },
		p1: { x: captureNet.p1.x + offset, y: captureNet.p1.y + offset },
		p2: { x: captureNet.p2.x + offset, y: captureNet.p2.y + offset },
		p3: { x: captureNet.p3.x + offset, y: captureNet.p3.y + offset },
	};
}

export const RotateCaptureNetFromVelocity = (captureNet: CaptureNetTrapezoid, velocity: Vec2): CaptureNetTrapezoid => {
	let rotation = 0;
	if (velocity.x == 0 && velocity.y == 0) {
		throw ("No velocity!");
	} else if (velocity.x == 1 && velocity.y == 0) {
		return captureNet;
	} else if (velocity.x == 1 && velocity.y == 1) {
		rotation = -Math.PI / 4;
	} else if (velocity.x == 1 && velocity.y == -1) {
		rotation = Math.PI / 4;
	} else if (velocity.x == -1 && velocity.y == 0) {
		rotation = Math.PI;
	} else if (velocity.x == -1 && velocity.y == 1) {
		rotation = -3 * Math.PI / 4;
	} else if (velocity.x == -1 && velocity.y == -1) {
		rotation = -5 * Math.PI / 4;
	} else if (velocity.x == 0 && velocity.y == 1) {
		rotation = -Math.PI / 2;
	} else if (velocity.x == 0 && velocity.y == -1) {
		rotation = Math.PI / 2;
	} else {
		throw ("brandon is a moron");
	}
	const rotationMatrix = Rotate(rotation);
	const p0 = Apply(rotationMatrix, captureNet.p0);
	const p1 = Apply(rotationMatrix, captureNet.p1);
	const p2 = Apply(rotationMatrix, captureNet.p2);
	const p3 = Apply(rotationMatrix, captureNet.p3);
	return {
		p0: p0,
		p1: p1,
		p2: p2,
		p3: p3,
	};
}

export const PointInsideTrapezoid = (trapezoid: CaptureNetTrapezoid, point: Vec2): boolean => {
	const l1 = LeftOfLine(trapezoid.p0, trapezoid.p1, point);
	const l2 = LeftOfLine(trapezoid.p1, trapezoid.p2, point);
	const l3 = LeftOfLine(trapezoid.p2, trapezoid.p3, point);
	const l4 = LeftOfLine(trapezoid.p3, trapezoid.p0, point);
	return l1 && l2 && l3 && l4;
}

export interface RasterizeVelocityResult {
	netScreen: CaptureNetScreen;
	cameras: Set<string>;
};

export const RasterizeVelocity = (exitEvent: ExitEvent, captureRadius: number, screen: Screen): RasterizeVelocityResult => {
	const velocity = NormalizeVelocity(exitEvent.velocity);
	const captureNet = NewCaptureNet(captureRadius, screen.meterSpan);
	const rotatedCaptureNet = RotateCaptureNetFromVelocity(captureNet, velocity);
	const net = OffsetCaptureNet(rotatedCaptureNet, screen.offset);


	let validCameras = new Set<string>();

	let pixels: boolean[][] = [];

	for (let row = 0; row < screen.screenSize; row++) {
		for (let column = 0; column < screen.screenSize; column++) {
			if (pixels[row] == undefined) {
				pixels[row] = [];
				for (let i = 0; i < screen.screenSize; i++) {
					pixels[row].push(false);
				}
			}
			const position: Vec2 = {
				x: column * screen.pixelSize,
				y: row * screen.pixelSize,
			};
			const inside = PointInsideTrapezoid(net, position);
			if (inside) {
				pixels[row][column] = inside;
				screen.pixels[row][column].cameras.forEach(cam => validCameras.add(cam));
			}
		}
	}

	return {
		netScreen: {
			pixels: pixels,
			meterSpan: screen.meterSpan,
			screenSize: screen.screenSize,
			pixelSize: screen.pixelSize,
		},
		cameras: validCameras
	};
}

export const GetValidCameras = (cameras: Camera[], exitEvent: ExitEvent, pixelsPerMeter: number, captureRadius: number): Camera[] => {
	const origin = cameras.find(cam => cam.uuid == exitEvent.events[0].camUUID);
	cameras = cameras.filter(cam => cam.uuid != origin.uuid);
	const canvasSize = GetCanvasSize(cameras, origin);
	const cameraPlots = cameras.map(cam => GetCameraPlot(cam, origin));
	const cameraScreen = RasterizeCameras(cameraPlots, pixelsPerMeter, canvasSize.x);
	const res = RasterizeVelocity(exitEvent, captureRadius, cameraScreen);

	let validCameras: Camera[] = [];

	res.cameras.forEach(cam => {
		validCameras.push(cameras.find(_cam => _cam.uuid == cam));
	});
	return validCameras;
}

