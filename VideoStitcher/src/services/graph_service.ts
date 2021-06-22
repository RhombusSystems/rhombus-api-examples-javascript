import { HumanEvent } from "../types/human_event"
import { ExitEvent, EnterEvent, FinalizedEvent } from "../types/events"
import { IOServer } from "../server/server"

export interface PlotGraphMessage {
	event: FinalizedEvent;
	id: number;
};

// export const ConvertMapToList = (events: Map<number, HumanEvent[]>): HumanEvent[] => {
//         let total: HumanEvent[] = [];
//         events.forEach((e) => {
//                 total = total.concat(e);
//         })
//         return total;
// }


export const SortEvents = (a: EnterEvent, b: EnterEvent) => {
	if (a.events[0].timestamp < b.events[0].timestamp) return -1;
	if (a.events[0].timestamp > b.events[0].timestamp) return 1;
	return 0;
}


export const SortHumanEventsByTime = (a: HumanEvent, b: HumanEvent) => {
	if (a.timestamp < b.timestamp) return -1;
	if (a.timestamp > b.timestamp) return 1;
	return 0;
}


export const SendGraph = (msg: PlotGraphMessage) => {
	if (!msg) return;
	// msg.events.sort(SortEvents);
	// msg.events.forEach(e => e.relatedEvents.sort(SortEvents));
	IOServer.Emit("Plot-Graph", msg);
}
