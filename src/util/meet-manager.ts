import { Entry, EventEntry, MeetInfo, TeamPoints } from "../types/common";
import Logger from "./logger";

const LOG_NAME = "meet-manager";

const DEFAULT_INDIVIDUAL_POINTS = [0, 20, 17, 16, 15, 14, 13, 12, 11, 9, 7, 6, 5, 4, 3, 2, 1];
const DEFAULT_RELAY_POINTS = [0, 40, 34, 32, 30, 28, 26, 24, 22, 18, 14, 12, 10, 8, 6, 4, 2];

export interface MissingEntry {
    eventNum: number;
    rank: number;
}

export interface MissingEventInfo {
    missingEvents: number[];
    missingEntries: MissingEntry[];
    errorEntries: MissingEntry[];
}

export interface MeetErrors {
    missingEventInfo: MissingEventInfo,
    unmappedRelayTeams: string[]
}

interface GetMissingEntriesInfo {
    missingEntries: MissingEntry[];
    errorEntries: MissingEntry[];
}

interface PointsMap {
    [team: string]: number;
}

interface TeamNameMap {
    [teamID: string]: string;
}

// TODO: This entire thing can probably be optimized
class MeetManager {
    private meetInfo: MeetInfo;
    private logger: Logger;

    constructor(meetInfo: MeetInfo) {
        this.meetInfo = meetInfo ? meetInfo : {
            teamInfo: []
        };
        this.logger = new Logger(LOG_NAME);
    }

    private getMissingEntries(eventEntry: EventEntry): GetMissingEntriesInfo {
        const missingEntries: MissingEntry[] = [];
        const errorEntries: MissingEntry[] = [];
        const sortedEntries: Entry[] = eventEntry.entries.sort((entry1: Entry, entry2: Entry): number => entry1.position - entry2.position);
        let rankDifference = 1;
        for (let i = 1; i < sortedEntries.length; i++) {
            const entryRank: number = sortedEntries[i].position;
            const prevEntryRank: number = sortedEntries[i - 1].position;
            if (entryRank === prevEntryRank) {
                rankDifference++;
            } else if (entryRank - prevEntryRank === rankDifference) {
                rankDifference = 1;
            } else if (entryRank - prevEntryRank > rankDifference) {
                for (let j = prevEntryRank + rankDifference; j < entryRank; j++) {
                    missingEntries.push({
                        eventNum: eventEntry.event.eventNum,
                        rank: j
                    });
                }
            } else {
                rankDifference = 1;
                errorEntries.push({
                    eventNum: eventEntry.event.eventNum,
                    rank: entryRank
                });
            }
        }
        return {
            missingEntries,
            errorEntries
        };
    }

    public getMissingEventEntries(eventEntries: EventEntry[]): MissingEventInfo {
        const sortedEventEntries: EventEntry[] = eventEntries.sort((eventEntry1: EventEntry, eventEntry2: EventEntry): number => eventEntry1.event.eventNum - eventEntry2.event.eventNum);
        const missingEvents: number[] = [];
        const missingEntries: MissingEntry[] = [];
        const errorEntries: MissingEntry[] = [];
        let expectedEventNum = 1;
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
            this.logger.log(JSON.stringify(eventEntry.event));
            const getMissingEntriesInfo: GetMissingEntriesInfo = this.getMissingEntries(eventEntry);
            missingEntries.push(...getMissingEntriesInfo.missingEntries);
            errorEntries.push(...getMissingEntriesInfo.errorEntries);
        }

        const result: MissingEventInfo = {
            missingEntries,
            missingEvents,
            errorEntries
        };
        this.logger.log(JSON.stringify(result));
        return result;
    }

    // Map relay team names to their respective individual team names
    public getAccurateTeamNames(eventEntries: EventEntry[]): EventEntry[] {
        const individualMap: TeamNameMap = {};
        const relayMap: TeamNameMap = {};
        const result: EventEntry[] = [];
        for (const teamInfo of this.meetInfo.teamInfo) {
            individualMap[teamInfo.individualName] = teamInfo.teamID;
            relayMap[teamInfo.relayName] = teamInfo.teamID;
        }
        this.logger.log(JSON.stringify(relayMap));
        for (const eventEntry of eventEntries) {
            const isRelay = eventEntry.event.isRelay;
            const entries: Entry[] = [];
            for (const entry of eventEntry.entries) {
                const prevName = entry.team;
                const map = isRelay ? relayMap : individualMap;
                const newName = map[prevName] ? map[prevName] : prevName;
                const newEntry = { ...entry };
                newEntry.team = newName;
                entries.push(newEntry);
            }
            result.push({
                event: eventEntry.event,
                entries
            });
        }
        return result;
    }

    public calculateTeamPoints(eventEntries: EventEntry[]): TeamPoints[] {
        const teamPoints: TeamPoints[] = [];
        const points: PointsMap = {};

        let individualPointsSystem: number[] = DEFAULT_INDIVIDUAL_POINTS;
        let relayPointsSystem: number[] = DEFAULT_RELAY_POINTS;

        if (this.meetInfo.pointsSystem) {
            individualPointsSystem = this.meetInfo.pointsSystem.individualPointsSystem;
            if (this.meetInfo.pointsSystem.relayPointsSystem) {
                relayPointsSystem = this.meetInfo.pointsSystem.relayPointsSystem;
            }
        }

        for (const eventEntry of eventEntries) {
            for (const entry of eventEntry.entries) {
                if (!points[entry.team]) {
                    points[entry.team] = 0;
                }
                const pointsSystem: number[] = eventEntry.event.isRelay ? relayPointsSystem : individualPointsSystem;
                points[entry.team] += pointsSystem[entry.position] ? pointsSystem[entry.position] : 0;
            }
        }
        for (const [key, value] of Object.entries(points)) {
            teamPoints.push({
                teamName: key,
                points: value
            });
        }
        return teamPoints;
    }
}

export default MeetManager;