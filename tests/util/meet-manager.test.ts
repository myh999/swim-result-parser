import { readFileSync } from "fs";
import { resolve } from "path";
import { MeetInfo, PsychSheet, TeamPoints } from "../../src/types/common";
import Logger from "../../src/util/logger";
import MeetManager from "../../src/util/meet-manager";

describe("meet-manager", () => {

    const MEET_MANAGER_TEST_LOG_NAME = "meet-manager-test";
    let manager: MeetManager;
    let logger: Logger;
    let psychSheetData: PsychSheet;
    let meetInfo: MeetInfo;


    beforeAll(() => {
        const rawMeetInfo = readFileSync(resolve(__dirname, "../../data/psych-sheet/meet-info-0.json"));
        meetInfo = JSON.parse(rawMeetInfo.toString());
        const rawData = readFileSync(resolve(__dirname, "../../data/psych-sheet/data-0.json"));
        psychSheetData = JSON.parse(rawData.toString());
        manager = new MeetManager(meetInfo);
        logger = new Logger(MEET_MANAGER_TEST_LOG_NAME);
    });

    test("validates results correctly", () => {
        const output = manager.getMissingEventEntries(psychSheetData.eventEntries);
        logger.log(JSON.stringify(output));
        expect(output.missingEntries.length).toEqual(0);
        expect(output.missingEvents.length).toEqual(0);
        expect(output.errorEntries.length).toEqual(0);
    });

    test("gets correct team names + gets team info correctly", () => {
        const output = manager.getAccurateTeamNames(psychSheetData.eventEntries);
        logger.log(JSON.stringify(output, null, 4));
        expect(output.length).toEqual(psychSheetData.eventEntries.length);

        const teamPoints: TeamPoints[] = manager.calculateTeamPoints(output);
        logger.log(JSON.stringify(teamPoints, null, 4));
        expect(teamPoints.length).toEqual(meetInfo.teamInfo.length);
    });
});