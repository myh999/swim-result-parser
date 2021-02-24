import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import request from "supertest";
import app from "../src/app";

const MEET_INFO_PATH = undefined;

const LIVE_RESULTS_BASE = "http://results.rectec.ca/oua20/";
const EVENT_START = 3;
const EVENT_END = 12;
const EXCLUDE_EVENTS = [];

describe("full-live-results-analysis", () => {
    test("full live results analysis", async (done) => {
        const meetInfoLocation = MEET_INFO_PATH ? resolve(__dirname, MEET_INFO_PATH) : undefined;

        const outputName = resolve(__dirname, `./live-results-analysis-output-${new Date().toISOString().replace(/[\/\\:]/g, "_")}.json`);
        const meetInfoString: string = meetInfoLocation ? readFileSync(meetInfoLocation).toString() : undefined;
        const events: number[] = [];

        for (let i = EVENT_START; i <= EVENT_END; i++) {
            if (EXCLUDE_EVENTS.includes(i)) continue;
            events.push(i);
        }

        let req = request(app).post("/analysis/live-results")
            .field("baseUrl", LIVE_RESULTS_BASE)
            .field("events", events);

        if (meetInfoString) {
            req = req.field("meetInfo", meetInfoString);
        }

        return await req.expect(200)
            .then((res) => {
                writeFileSync(outputName, JSON.stringify(JSON.parse(res.text), undefined, 4));
                done();
            }).catch((err) => {
                done(err);
            });
    });
});
