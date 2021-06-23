import { HumanEvent } from "../types/human_event"
import { divide, subtract, Vec2 } from "../types/vector"

export const GetVelocity = (a: HumanEvent, b: HumanEvent):Vec2 => {
	return divide(subtract(b.position, a.position), (b.timestamp - a.timestamp));
}
