import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Gender, MeetInfo, TeamPoints } from "../src/types/common";
import MeetManager from "../src/util/meet-manager";
import PDFParser from "../src/util/pdf-parser";

function pointsDesc(points1: TeamPoints, points2: TeamPoints): number {
    return points2.points - points1.points;
}

const PSYCH_SHEET_PATH = "../data/psych-sheet/psych-sheet-3.pdf";
const MEET_INFO_PATH = "../data/psych-sheet/meet-info-3.json";

describe("full-psych-sheet-analysis", () => {
    test("full psych sheet analysis", async () => {
        const psychSheetLocation = resolve(__dirname, PSYCH_SHEET_PATH);
        const meetInfoLocation = resolve(__dirname, MEET_INFO_PATH);

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
        const points = manager.calculateTeamPoints(processedEvents).sort(pointsDesc);

        const maleEvents = processedEvents.filter((eventEntry) => { return eventEntry.event.gender === Gender.MALE; });
        const malePoints = manager.calculateTeamPoints(maleEvents).sort(pointsDesc);

        const femaleEvents = processedEvents.filter((eventEntry) => { return eventEntry.event.gender === Gender.FEMALE; });
        const femalePoints = manager.calculateTeamPoints(femaleEvents).sort(pointsDesc);

        const allPoints = {
            totalPoints: points,
            malePoints,
            femalePoints
        };

        writeFileSync(pointsName, JSON.stringify(allPoints, undefined, 4));
    });
});