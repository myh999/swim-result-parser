import { Entry, EventEntry, Event, Name, Time } from "../types/common";
import StringMatcher from "./string-matcher";

export enum Field {
    POSITION = "position",
    TEAM = "team",
    NAME = "name",
    RELAY = "relay",
    SEED_TIME = "seedTime",
    PRELIM_TIME = "prelimTime",
    FINAL_TIME = "finalTime"
}

class Parser {
    private individualFields: Field[];
    private relayFields: Field[];
    protected matcher: StringMatcher;

    constructor(individualFields: Field[], relayFields: Field[]) {
        this.individualFields = individualFields;
        this.relayFields = relayFields;
        this.matcher = new StringMatcher();
    }

    private parseEntry(line: string[], currentEvent: Event): Entry {
        const fields: Field[] = currentEvent.isRelay ? this.relayFields : this.individualFields;
        const entry: Entry = {
            position: undefined,
            team: undefined
        };
        let index = 0;
        for (const field of fields) {
            let getter: (input:string) => number | string | Name | Time;
            if (field === Field.POSITION) {
                getter = this.matcher.getPosition;
            } else if (field === Field.TEAM) {
                getter = this.matcher.getTeam;
            } else if (field === Field.NAME) {
                getter = this.matcher.getLastFirstName;
            } else if (field === Field.RELAY) {
                getter = this.matcher.getRelay;
            } else if (field === Field.SEED_TIME
                        || field === Field.PRELIM_TIME
                        || field === Field.FINAL_TIME) {
                
                getter = this.matcher.getTime;
            } else {
                return undefined;
            }
            
            let value: number | string | Name | Time;
            while (index < line.length && !value) {
                value = getter(line[index]);
                index++;
            }
            if (!value) return undefined;
            const fieldName: string = field;
            entry[fieldName] = value;
        }
        if (!entry.position || !entry.team) return undefined;
        return entry;
    }

    protected parseLines(lines: string[][]): EventEntry[] {
        const eventEntries: EventEntry[] = [];

        let currentEvent: Event;
        let currentEntries: Entry[] = [];

        for (const line of lines) {
            const event: Event = this.matcher.getEvent(line[0]);
            if (event) {
                // We have a new event
                if (currentEvent && currentEntries.length !== 0) {
                    eventEntries.push({
                        event: currentEvent,
                        entries: currentEntries
                    });
                }

                currentEvent = event;
                currentEntries = [];
            } else if (currentEvent) {
                const entry: Entry = this.parseEntry(line, currentEvent);
                if (entry) {
                    currentEntries.push(entry);
                }
            }
        }

        // Push the remaining entries
        if (currentEvent && currentEntries.length !== 0) {
            eventEntries.push({
                event: currentEvent,
                entries: currentEntries
            });
        }

        return eventEntries;
    }
}

export default Parser;
