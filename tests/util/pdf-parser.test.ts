import { resolve } from "path";
import PDFParser from "../../src/util/pdf-parser";
import Logger from "../../src/util/logger";
import { readFileSync } from "fs";

describe("pdf-converter", () => {
    const LOG_PATH = "pdf-parser-test";
    let logger: Logger;

    beforeAll(() => {
        logger = new Logger(LOG_PATH, "json");
    });

    test("successfully converts psych sheet to meet data", async () => {
        const input1 = "../../data/psych-sheet/psych-sheet-0.pdf";
        const fullPath1 = resolve(__dirname, input1);
        const rawOutput1 = readFileSync(resolve(__dirname, "../../data/psych-sheet/data-0.json"));
        const expectedOutput1 = JSON.parse(rawOutput1.toString());

        const parser = new PDFParser(fullPath1);
        const output = await parser.getText();
        logger.log(JSON.stringify(output));
        expect(output).toEqual(expectedOutput1);
    });
});
