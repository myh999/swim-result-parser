jest.mock("node-fetch");

import { readFileSync } from "fs";
import { resolve } from "path";
import request from "supertest";
import app from "../src/app";
import fetch, { Response, RequestInfo } from "node-fetch";

describe("app", () => {

    let basePath: string;
    let mockFetch: jest.MockedFunction<typeof fetch>;
    beforeAll(() => {
        basePath = resolve(__dirname, "../data/live-results/results.rectec.ca/");
        mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch = mockFetch.mockImplementation(async (url: RequestInfo): Promise<Response> => {
            const path = resolve(basePath, new URL(url.toString()).pathname.replace("/", ""));
            const result = readFileSync(path).toString();
            const response = new Response(result);
            response.text = () => Promise.resolve(result);
            return response;
        });
    });

    test("returns 200 on psych-sheet", (done) => {
        const pdfPath = resolve(__dirname, "../data/psych-sheet/psych-sheet-0.pdf");
        request(app).post("/analysis/psych-sheet/").attach("psychsheet", pdfPath).expect(200, done);
    });

    test("returns 200 on live-results", (done) => {
        const baseUrl = "http://results.rectec.ca/oua20/";
        const events = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        request(app).post("/analysis/live-results/")
            .field("baseUrl", baseUrl)
            .field("events", events)
            .expect(200, done);
    });

    test("returns 200 on demo", (done) => {
        request(app).get("/demo/").expect(200, done);
    });

    test("returns 200 on demo/psych-sheet", (done) => {
        request(app).get("/demo/psych-sheet/").expect(200, done);
    });
});
