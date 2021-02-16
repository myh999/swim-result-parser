import { resolve } from "path";
import PDFParser from "../../src/util/pdf-parser";
import MeetValidator from "../../src/util/meet-validator";
import Logger from "../../src/util/logger";
import PointsCalculator from "../../src/util/points-calculator";

describe("pdf-converter", () => {
    const LOG_PATH = "pdf-parser-test.json";
    const LOG_PATH2 = "pdf-parser-points.json";
    let logger: Logger;

    beforeAll(() => {
        logger = new Logger(LOG_PATH);
    });

    test("successfully converts pdf to meet data", async () => {
        const inputPdf = "../../data/example1.pdf";
        const fullPath = resolve(__dirname, inputPdf);

        const parser = new PDFParser(fullPath);
        const output = await parser.getText();
        logger.log(JSON.stringify(output));
        expect(output.eventEntries.length).not.toBe(0);

        const validator = new MeetValidator();
        const missingInfo = validator.getMissingInfo(output);
        expect(missingInfo.missingEntries.length).toEqual(0);
        expect(missingInfo.missingEvents.length).toEqual(0);

        const pointsCalculator = new PointsCalculator();
        const points = pointsCalculator.calculateTeamPoints(output.eventEntries);
        Logger.log(JSON.stringify(points), LOG_PATH2);
    });
});
