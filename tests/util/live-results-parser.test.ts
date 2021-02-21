import { readFileSync } from "fs";
import { resolve } from "path";
import Logger from "../../src/util/logger";
import LiveResultsParser from "../../src/util/live-results-parser";

describe("live-results-parser", () => {

    const LOG_PATH = "live-results-parser-test";
    let logger: Logger;
    let parser: LiveResultsParser;

    beforeAll(() => {
        logger = new Logger(LOG_PATH);
        parser = new LiveResultsParser();
    });

    test("parses individual live results successfully", () => {
        const path = resolve(__dirname, "../../data/live-results/live-results-0.html");
        const inputHtml = readFileSync(path).toString();
        const output = parser.parseHtml(inputHtml);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });

    test("parses relay live results successfully", () => {
        const path = resolve(__dirname, "../../data/live-results/live-results-1.html");
        const inputHtml = readFileSync(path).toString();
        const output = parser.parseHtml(inputHtml);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });

    test("parses a single url successfully", async () => {
        const url = "http://results.rectec.ca/oua20/200206P004.htm";
        const output = await parser.parseUrl(url);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });

    test("parses a multiple urls successfully", async () => {
        const urls = ["http://results.rectec.ca/oua20/200206P004.htm", "http://results.rectec.ca/oua20/200206F002.htm"];
        const output = await parser.parseUrls(urls);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });
});