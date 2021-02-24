import { EventEntry } from "../types/common";
import Parser, { Field } from "./parser";
import fetch from "node-fetch";

export interface LiveResults {
    eventEntries: EventEntry[];
}

class LiveResultsParser extends Parser {

    constructor() {
        const individualFields: Field[] = [
            Field.POSITION,
            Field.NAME,
            Field.TEAM,
            Field.PRELIM_TIME
        ];
        const relayFields: Field[] = [
            Field.POSITION,
            Field.TEAM,
            Field.RELAY,
            Field.FINAL_TIME
        ];
        super(individualFields, relayFields);
    }

    public parseHtml(inputHtml: string): EventEntry {
        const cleanHtml = inputHtml.replace(/(<([^>]+)>)/gi, "");
        const rawLines = cleanHtml.split("\n");
        const lines: string[][] = rawLines.map((rawLine: string): string[] => {
            // Then line doesn't start with a number, then it isn't an entry
            if (isNaN(parseInt(rawLine))) {
                // We don't need to split non-entries
                return [rawLine];
            }

            // Most entry fields are separated by 2 spaces
            const split1 = rawLine.trim().split(/  +/);
            const split2 = [];
            for (const word of split1) {
                if (isNaN(parseInt(word))) {
                    split2.push(word);
                    continue;
                }

                // A number and a field are separated by 1 space
                const singleSpaceSplit = word.split(" ");
                if (singleSpaceSplit.length === 0) continue;
                split2.push(singleSpaceSplit[0]);
                const remaining = singleSpaceSplit.slice(1, singleSpaceSplit.length).join(" ");
                if (remaining) split2.push(remaining);
            }

            return split2;
        });

        return this.parseLines(lines)[0];
    }

    public async parseUrl(url: string): Promise<EventEntry> {
        const rawResult = await fetch(url);
        const html = await rawResult.text();
        return this.parseHtml(html);
    }

    public async parseUrls(urls: string[]): Promise<EventEntry[]> {
        const promises = urls.map((url: string): Promise<EventEntry> => { return this.parseUrl(url); });
        const results: EventEntry[] = await Promise.all(promises);
        return results.filter((eventEntry: EventEntry): boolean => { return eventEntry !== undefined; });
    }

    public async parseBaseUrl(baseUrl: string, events: number[], isFinal: boolean = false): Promise<EventEntry[]> {
        const rawEvtIndex = await fetch(`${baseUrl}evtindex.htm`);
        const textEvtIndex = await rawEvtIndex.text();
        
        const pattern = isFinal ? /href="[0-9]+F[0-9]+.htm"/g : /href="[0-9]+P[0-9]+.htm"/g;
        const links = textEvtIndex.match(pattern);
        const eventUrls: string[] = [];

        const evtPrefix = isFinal ? "F" : "P";
        for (let link of links) {
            link = link.replace(/(href=)|"/g, "");
            const split = link.split(evtPrefix);
            if (split.length !== 2) continue;
            const evtNum = parseInt(split[1]);
            if (!isNaN(evtNum) && events.includes(evtNum)) {
                eventUrls.push(`${baseUrl}${link}`);
            }
        }

        return this.parseUrls(eventUrls);
    }

}

export default LiveResultsParser;
