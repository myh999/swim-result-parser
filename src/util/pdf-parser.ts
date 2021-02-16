import { getDocument } from "pdfjs-dist/es5/build/pdf.js";
import {
    PDFDocumentProxy,
    PDFPageProxy,
    TextContent,
    TextItem,
} from "pdfjs-dist/types/display/api";
import { Entry, EventEntry, Meet, Event, Time, Name, Team, AlternateTime } from "../types/common";
import { Config } from "../types/config";
import Logger from "./logger";
import StringMatcher from "./string-matcher";

const COL_ERR = 10;
const ROW_ERR = 5;
const LOG_PATH = "pdf-parser.log";

interface TextInfo {
    text: string;
    height: number;
    width: number;
    xPos: number;
    yPos: number;
}

interface PageInfo {
    width: number;
    height: number;
    text: TextInfo[];
}

class PDFParser {
    path: string;
    matcher: StringMatcher;
    columns: number[];
    logger: Logger;

    constructor(config: Config, path: string) {
        this.path = path;
        this.matcher = new StringMatcher(config);
        this.columns = [];
        this.logger = new Logger(LOG_PATH);
    }

    private async getTextFromPage(doc: PDFDocumentProxy, pageNum: number): Promise<PageInfo> {
        const page: PDFPageProxy = await doc.getPage(pageNum);
        const content: TextContent = await page.getTextContent();
        const textInfo: TextInfo[] = content.items.map((item: TextItem) => {
            return {
                text: item.str,
                height: item.height,
                width: item.width,
                xPos: item.transform[4],
                yPos: item.transform[5]
            };
        });
        return {
            width: page.view[2],
            height: page.view[3],
            text: textInfo
        };
    }

    private getEntry(row: TextInfo[], currentEvent: Event): Entry {
        row = row.sort((text1: TextInfo, text2: TextInfo) => {
            return text1.xPos - text2.xPos;
        });

        const log = row.map((info) => ({ text: info.text, xPos: info.xPos }));
        this.logger.log(JSON.stringify(log));

        if (currentEvent.isRelay === false) {
            // Individual: Rank, Name, Year, School, Seed Time
            let index = 0;
            let rank: number;
            let name: Name;
            let school: Team;
            let seedTime: Time | AlternateTime;
            while (index < row.length && !rank) {
                rank = parseInt(row[index].text);
                index++;
            }
            if (!rank) return undefined;

            while (index < row.length && !name) {
                name = this.matcher.getLastFirstName(row[index].text);
                index++;
            }
            if (!name) return undefined;

            while (index < row.length && !school) {
                school = this.matcher.getTeam(row[index].text, currentEvent.isRelay);
                index++;
            }
            if (!school) return undefined;

            while (index < row.length && !seedTime) {
                seedTime = this.matcher.getTime(row[index].text) || this.matcher.getAlternateTime(row[index].text);
                index++;
            }
            if (!seedTime) return undefined;

            return {
                rank,
                name,
                team: school.name,
                seedTime
            };
        } else {
            // Relay: Rank, Team, Relay, Seed Time
            let index = 0;
            let rank: number;
            let team: Team;
            let relay: string;
            let seedTime: Time | AlternateTime;

            while (index < row.length && !rank) {
                rank = parseInt(row[index].text);
                index++;
            }
            if (!rank) return undefined;

            while (index < row.length && !team) {
                team = this.matcher.getTeam(row[index].text, currentEvent.isRelay);
                index++;
            }
            if (!team) return undefined;

            while (index < row.length && !relay) {
                const tmp: string[] = row[index].text.match(new RegExp("[A-Z]"));
                relay = tmp && tmp.length > 0 ? tmp[0] : undefined;
                index++;
            }
            if (!relay) return undefined;

            while (index < row.length && !seedTime) {
                seedTime = this.matcher.getTime(row[index].text) || this.matcher.getAlternateTime(row[index].text);
                index++;
            }
            if (!seedTime) return undefined;

            return {
                rank,
                team: team.name,
                relay,
                seedTime
            };
        }
    }

    private parsePage(page: PageInfo): EventEntry[] {
        const eventEntries: EventEntry[] = [];

        const groupedLines: TextInfo[][] = []; // Lines grouped per column
        this.columns.forEach((colPos: number, index: number) => {
            const startPos = colPos;
            const endPos = index < this.columns.length - 1 ? this.columns[index + 1] : page.width;
            const group: TextInfo[] = page.text.filter((textInfo: TextInfo): boolean => {
                return textInfo.xPos >= startPos && textInfo.xPos <= endPos - COL_ERR;
            });
            groupedLines.push(group);
        });
        let currentEvent: Event;
        let currentEntries: Entry[] = [];
        for (const lineGroup of groupedLines) {
            // Sort lines from top to bottom
            const sortedGroup: TextInfo[] = lineGroup.sort((line1: TextInfo, line2: TextInfo): number => {
                // Descending order
                return line2.yPos - line1.yPos;
            });
            let index = 0;
            while (index < sortedGroup.length) {
                const currentYPos = sortedGroup[index].yPos;
                const currentRow: TextInfo[] = [];

                // Get next line
                while (index < sortedGroup.length && Math.abs(sortedGroup[index].yPos - currentYPos) < ROW_ERR) {
                    currentRow.push(sortedGroup[index]);
                    index++;
                }

                const event: Event = this.matcher.getEvent(currentRow[0].text);
                if (event) {
                    // We have a new event
                    this.logger.log(JSON.stringify(event));
                    if (currentEvent && currentEntries.length !== 0) {
                        eventEntries.push({
                            event: currentEvent,
                            entries: currentEntries
                        });
                    }

                    currentEvent = event;
                    currentEntries = [];
                } else if (currentEvent) {
                    const entry: Entry = this.getEntry(currentRow, currentEvent);
                    if (entry) {
                        currentEntries.push(entry);
                    }
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

    public async getText(): Promise<Meet> {
        const doc: PDFDocumentProxy = await getDocument(this.path).promise;
        const pagePromises: Promise<PageInfo>[] = [];
        for (let i = 0; i < doc.numPages; i++) {
            pagePromises.push(this.getTextFromPage(doc, i + 1));
        }

        const pages: PageInfo[] = await Promise.all(pagePromises);

        // Get starting X values of columns
        this.columns = [];
        const texts: TextInfo[] = [];
        for (const page of pages) {
            texts.push(...page.text);
        }
        for (const textInfo of texts) {
            if (this.matcher.getEvent(textInfo.text)) {
                if (!this.columns.some((col: number): boolean => {
                    return Math.abs(col - textInfo.xPos) < COL_ERR;
                })) {
                    this.columns.push(textInfo.xPos);
                }
            }
        }

        const eventEntries: EventEntry[] = [];
        for (const page of pages) {
            eventEntries.push(...this.parsePage(page));
        }

        // Merge duplicate entries across pages
        // TODO: We can optimize this
        const mergedEntries: EventEntry[] = [];
        for (const entry of eventEntries) {
            const duplicateEntry = mergedEntries.find((compare: EventEntry): boolean => {
                return compare.event.eventNum === entry.event.eventNum;
            });
            if (duplicateEntry) {
                duplicateEntry.entries.push(...entry.entries);
            } else {
                mergedEntries.push(entry);
            }
        }

        return {
            eventEntries: mergedEntries
        };
    }
}

export default PDFParser;
