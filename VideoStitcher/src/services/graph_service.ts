import { HumanEvent } from "../types/human_event"
import { IOServer } from "../server/server"

export interface PlotGraphMessage {
	events: HumanEvent[];
	relatedEvents: HumanEvent[];
	id: number;
};

export const ConvertMapToList = (events: Map<number, HumanEvent[]>): HumanEvent[] => {
	let total: HumanEvent[] = [];
	events.forEach((e) => {
		total = total.concat(e);
	})
	return total;
}


export const SortHumanEvents = (a: HumanEvent, b: HumanEvent) => {
	if (a.id < b.id) return -1;
	if (a.id > b.id) return 1;
	return 0;
}

export const SendGraph = (msg: PlotGraphMessage) => {
	msg.events.sort(SortHumanEvents);
	msg.relatedEvents.sort(SortHumanEvents);
	IOServer.Emit("Plot-Graph", msg);
}
