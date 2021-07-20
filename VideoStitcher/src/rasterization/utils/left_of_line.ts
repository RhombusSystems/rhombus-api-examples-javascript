import { Vec2 } from "../../types/vector"


/*
  *
  * @export
  * @method Tests whether a point is to the left of a line. 
  * NOTE: Order of the points `a` and `b` matters. If you think of a line, the "left" changes based on where you start drawing the line. Keep this in mind when using this method. See the figure below!
  *
  * @param {Vec2} [a] The first point of the line (starting from the "bottom" of the line).
  * @param {Vec2} [b] The second point of the line (starting from the "bottom" of the line).
  * @param {Vec2} [c] The point to test
  *
  * @return {boolean} Returns point `c` is to the left of the line ab
  * */
export const LeftOfLine = (a: Vec2, b: Vec2, c: Vec2): boolean => {
	/*
	  *
	  *
	  *
	  *              2
	  *              |
	  *              |
	  *   LEFT       |
	  *              |
	  *              |
	  *              1
	  *
	  *
	  *
	  *              1
	  *              |
	  *              |
	  *              |       LEFT
	  *              |
	  *              |
	  *              2
	  *
	  * */
	return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
}
