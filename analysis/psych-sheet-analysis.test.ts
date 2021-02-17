import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { MeetInfo } from "../src/types/common";
import MeetManager from "../src/util/meet-manager";
import PDFParser from "../src/util/pdf-parser";

describe("full-psych-sheet-analysis", () => {
    test("full psych sheet analysis", async () => {
        const psychSheetLocation = resolve(__dirname, "../data/psych-sheet/psych-sheet-0.pdf");
        const meetInfoLocation = resolve(__dirname, "../data/psych-sheet/meet-info-0.json");

        const outputDirectory = resolve(__dirname, `./psych-sheet-analysis-output-${new Date().toISOString().replace(/[\/\\:]/g, "_")}`);
        const meetDataName = resolve(outputDirectory, "./meet-data.json");
        const missingEntriesName = resolve(outputDirectory, "./missing-entries.json");
        const pointsName = resolve(outputDirectory, "./points.json");

        const meetInfo: MeetInfo = JSON.parse(readFileSync(meetInfoLocation).toString());
        const manager: MeetManager = new MeetManager(meetInfo);
        const parser: PDFParser = new PDFParser(psychSheetLocation);

        mkdirSync(outputDirectory);

        const meetData = await parser.getText();
        writeFileSync(meetDataName, JSON.stringify(meetData, undefined, 4));

        const missingData = manager.getMissingEventEntries(meetData.eventEntries);
        writeFileSync(missingEntriesName, JSON.stringify(missingData, undefined, 4));

        const processedEvents = manager.getAccurateTeamNames(meetData.eventEntries);
        const points = manager.calculateTeamPoints(processedEvents);
        const sortedPoints = points.sort((points1, points2) => { return points2.points - points1.points; });
        writeFileSync(pointsName, JSON.stringify(sortedPoints, undefined, 4));
    });
});