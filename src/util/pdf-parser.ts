import { getDocument } from "pdfjs-dist/es5/build/pdf.js";
import {
    PDFDocumentProxy,
    PDFPageProxy,
    TextContent,
    TextItem,
} from "pdfjs-dist/types/display/api";
import { EventEntry, PsychSheet } from "../types/common";
import Parser, { Field } from "./parser";

const COL_ERR = 10;
const ROW_ERR = 5;

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

class PDFParser extends Parser {
    path: string;
    columns: number[];

    constructor(path: string) {
        const individualFields: Field[] = [
            Field.POSITION, Field.NAME, Field.TEAM, Field.SEED_TIME
        ];
        const relayFields = [
            Field.POSITION, Field.TEAM, Field.RELAY, Field.SEED_TIME
        ];
        super(individualFields, relayFields);
        this.path = path;
        this.columns = [];
    }

    private async getTextFromPage(doc: PDFDocumentProxy, pageNum: number): Promise<PageInfo> {
        const page: PDFPageProxy = await doc.getPage(pageNum);
        const content: TextContent = await page.getTextContent();
        const textInfo: TextInfo[] = content.items.map((item: TextItem) => ({
            text: item.str,
            height: item.height,
            width: item.width,
            xPos: item.transform[4],
            yPos: item.transform[5]
        }));
        return {
            width: page.view[2],
            height: page.view[3],
            text: textInfo
        };
    }

    private parsePage(page: PageInfo): EventEntry[] {

        const groupedLines: TextInfo[][] = []; // Lines grouped per column
        this.columns.forEach((colPos: number, index: number) => {
            const startPos = colPos;
            const endPos = index < this.columns.length - 1 ? this.columns[index + 1] : page.width;
            const group: TextInfo[] = page.text.filter((textInfo: TextInfo): boolean => textInfo.xPos >= startPos && textInfo.xPos <= endPos - COL_ERR);
            groupedLines.push(group);
        });

        const rows: string[][] = [];
        for (const lineGroup of groupedLines) {
            // Sort lines from top to bottom
            const sortedGroup: TextInfo[] = lineGroup.sort((line1: TextInfo, line2: TextInfo): number =>
                // Descending order
                line2.yPos - line1.yPos
            );
            let index = 0;
            while (index < sortedGroup.length) {
                const currentYPos = sortedGroup[index].yPos;
                const currentRow: TextInfo[] = [];

                // Get next line
                while (index < sortedGroup.length && Math.abs(sortedGroup[index].yPos - currentYPos) < ROW_ERR) {
                    currentRow.push(sortedGroup[index]);
                    index++;
                }

                const sortedRow = currentRow.sort((text1: TextInfo, text2: TextInfo) => text1.xPos - text2.xPos);
                const rowText = sortedRow.map((textInfo: TextInfo) => { return textInfo.text; });

                rows.push(rowText);
            }
        }

        return this.parseLines(rows);
    }

    public async getText(): Promise<PsychSheet> {
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
                if (!this.columns.some((col: number): boolean => Math.abs(col - textInfo.xPos) < COL_ERR)) {
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
            const duplicateEntry = mergedEntries.find((compare: EventEntry): boolean => compare.event.eventNum === entry.event.eventNum);
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
