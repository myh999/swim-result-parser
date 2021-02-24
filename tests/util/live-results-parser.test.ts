jest.mock("node-fetch");

import { readFileSync } from "fs";
import { resolve } from "path";
import Logger from "../../src/util/logger";
import LiveResultsParser from "../../src/util/live-results-parser";
import fetch, { Response, RequestInfo } from "node-fetch";

describe("live-results-parser", () => {

    const LOG_PATH = "live-results-parser-test";
    let logger: Logger;
    let parser: LiveResultsParser;
    let basePath: string;
    let mockFetch: jest.MockedFunction<typeof fetch>;

    beforeAll(() => {
        logger = new Logger(LOG_PATH);
        parser = new LiveResultsParser();
        basePath = resolve(__dirname, "../../data/live-results/results.rectec.ca/");
        mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch = mockFetch.mockImplementation(async (url: RequestInfo): Promise<Response> => {
            const path = resolve(basePath, new URL(url.toString()).pathname.replace("/", ""));
            const result = readFileSync(path).toString();
            const response = new Response(result);
            response.text = () => Promise.resolve(result);
            return response;
        });
    });

    test("parses individual live results successfully", () => {
        logger.log("Test 1");
        const path = resolve(__dirname, "../../data/live-results/live-results-0.html");
        const inputHtml = readFileSync(path).toString();
        const output = parser.parseHtml(inputHtml);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });

    test("parses relay live results successfully", () => {
        logger.log("Test 2");
        const path = resolve(__dirname, "../../data/live-results/live-results-1.html");
        const inputHtml = readFileSync(path).toString();
        const output = parser.parseHtml(inputHtml);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });

    test("parses a single url successfully", async () => {
        logger.log("Test 3");
        const url = "http://results.rectec.ca/oua20/200206P004.htm";
        const output = await parser.parseUrl(url);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });

    test("parses a multiple urls successfully", async () => {
        logger.log("Test 4");
        const urls = ["http://results.rectec.ca/oua20/200206P004.htm", "http://results.rectec.ca/oua20/200206F002.htm"];
        const output = await parser.parseUrls(urls);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });

    test("parses the base url correctly", async () => {
        logger.log("Test 5");
        const baseUrl = "http://results.rectec.ca/oua20/";
        const events = [4, 3, 23];
        const output = await parser.parseBaseUrl(baseUrl, events);
        logger.log(JSON.stringify(output, undefined, 4));
        expect(output).toBeTruthy();
    });
});