import { Vec2 } from "../types/vector"

/*
  *
  * @export
  * @interface Mat2
  * 
  * This is a 2x2 matrix
  * */
export interface Mat2 {
	/*
	  * @type {[number, number, number, number]} The tuple of 4 numbers which are the elements of the matrix
	  * @memberof Mat2
	  * */
	values: [number, number, number, number];
};

/*
  *
  * @export
  * @method Applies a transformation to a vector: (Mat2) * (Vec2)
  *
  * @param {Mat2} [matrix] The transformation to be applied
  * @param {Vec2} [vec] The vector which the transformation will be applied to
  *
  * @return {Vec2} Returns the resulting vector after the transformation
  * */
export function Apply(matrix: Mat2, vec: Vec2): Vec2 {
	return {
		x: vec.x * matrix.values[0] + vec.y * matrix.values[1],
		y: vec.x * matrix.values[2] + vec.y * matrix.values[3],
	};
}

/*
  *
  * @export
  * @method Creates a 2x2 rotation matrix
  *
  * @param {number} [theta] The rotation this matrix will rotate by
  *
  * @return {Mat2} Returns the resulting 2x2 rotation matrix
  * */
export const Rotate = (theta: number): Mat2 => {
	return {
		values: [Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta)],
	};
}
