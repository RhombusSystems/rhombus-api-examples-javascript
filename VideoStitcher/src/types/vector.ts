/*
  *
  * @export
  * @interface Vec2
  * */
export interface Vec2 {
	/*
	  * @type {number} X value of this vector
	  * @memberof Vec2
	  * */
	x: number;

	/*
	  * @type {number} Y value of this vector
	  * @memberof Vec2
	  * */
	y: number;

};

export const add = (a: Vec2, b: Vec2): Vec2 => {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
	};
}

export const subtract = (a: Vec2, b: Vec2): Vec2 => {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
	};
}

export const dot = (a: Vec2, b: Vec2): number => {
	return a.x * b.x + a.y * b.y;
}

export const abs = (a: Vec2): Vec2 => {
	return {
		x: Math.abs(a.x),
		y: Math.abs(a.y),
	};
}

export const len = (a: Vec2): number => {
	return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
}

export function compare(a: Vec2, b: number): number;
export function compare(a: Vec2, b: Vec2): number;
export function compare(a: Vec2, b: any): number {
	if(b.x == undefined) {
		if(len(a) > b) return -1;
		if(len(a) < b) return 1;
		return 0;
	} else {
		if(len(a) > len(b)) return -1;
		if(len(a) < len(b)) return 1;
		return 0;
	}
}

export function divide(a: Vec2, b: number): Vec2;
export function divide(a: Vec2, b: Vec2): Vec2;
export function divide(a: Vec2, b: any): any {
	if (b.x == undefined) {
		return {
			x: a.x / b,
			y: a.y / b,
		};
	} else {
		// Haven't implemented vector division yet
		return undefined;
	}
}
