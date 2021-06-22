import { HumanEvent } from "../types/human_event"

export const GetVelocity = (a: HumanEvent, b: HumanEvent) => {
	return (b.position.x - a.position.x) / (b.timestamp - a.timestamp)
}
