import { Entry, EventEntry, Meet } from "../types/common";
import Logger from "./logger";

const LOG_PATH = "meet-validator.log";

export interface MissingEntry {
    eventNum: number;
    rank: number;
}

export interface MissingInfo {
    missingEvents: number[];
    missingEntries: MissingEntry[];
}

// TODO: This entire thing can probably be optimized
class MeetValidator {

    private getMissingEntries(eventEntry: EventEntry): MissingEntry[] {
        let expectedRank = 1;
        const missingEntries: MissingEntry[] = [];
        const sortedEntries: Entry[] = eventEntry.entries.sort((entry1: Entry, entry2: Entry): number => {
            return entry1.rank - entry2.rank;
        });
        for (const entry of sortedEntries) {
            if (entry.rank > expectedRank) {
                while (expectedRank < entry.rank) {
                    missingEntries.push({
                        eventNum: eventEntry.event.eventNum,
                        rank: expectedRank
                    });
                    expectedRank++;
                }
            } else if (entry.rank < expectedRank) {
                throw Error("MeetValidator.GetMissingInfo: Current rank is less than the expected rank");
            }
            Logger.log(JSON.stringify(entry), LOG_PATH);
            expectedRank++;
        }
        return missingEntries;
    }

    public getMissingInfo(meet: Meet): MissingInfo {
        const sortedEventEntries: EventEntry[] = meet.eventEntries.sort((eventEntry1: EventEntry, eventEntry2: EventEntry): number => {
            return eventEntry1.event.eventNum - eventEntry2.event.eventNum;
        });
        const missingEvents: number[] = [];
        const missingEntries: MissingEntry[] = [];
        let expectedEventNum = 1;
        Logger.clearLog(LOG_PATH);
        for (const eventEntry of sortedEventEntries) {
            if (eventEntry.event.eventNum > expectedEventNum) {
                while (expectedEventNum < eventEntry.event.eventNum) {
                    missingEvents.push(expectedEventNum);
                    expectedEventNum++;
                }
            } else if (eventEntry.event.eventNum < expectedEventNum) {
                throw Error("MeetValidator.GetMissingInfo: Current event num is less than the expected even num");
            }
            expectedEventNum++;
            Logger.log(JSON.stringify(eventEntry.event), LOG_PATH);
            missingEntries.push(...this.getMissingEntries(eventEntry));
        }

        const result: MissingInfo = {
            missingEntries,
            missingEvents
        };
        Logger.log(JSON.stringify(result), LOG_PATH);
        return result;
    }
}

export default MeetValidator;