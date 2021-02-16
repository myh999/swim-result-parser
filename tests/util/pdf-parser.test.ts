import { readFileSync } from "fs";
import { resolve } from "path";
import PDFParser from "../../src/util/pdf-parser";
import MeetValidator from "../../src/util/meet-validator";
import Logger from "../../src/util/logger";

describe("pdf-converter", () => {
    const LOG_PATH = "pdf-parser-test.json";
    let logger: Logger;

    beforeAll(() => {
        logger = new Logger(LOG_PATH);
    });

    test("successfully converts pdf to meet data", async () => {
        const inputPdf = "../../data/example1.pdf";
        const fullPath = resolve(__dirname, inputPdf);

        const rawConfig = readFileSync(resolve(__dirname, "../../data/config1.json"));
        const config = JSON.parse(rawConfig.toString());

        const parser = new PDFParser(config, fullPath);
        const output = await parser.getText();
        logger.log(JSON.stringify(output));
        expect(output.eventEntries.length).not.toBe(0);

        const missingInfo = MeetValidator.GetMissingInfo(output);
        expect(missingInfo.missingEntries.length).toEqual(0);
        expect(missingInfo.missingEvents.length).toEqual(0);
    });
});
