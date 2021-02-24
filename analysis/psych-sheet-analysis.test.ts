import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import request from "supertest";
import app from "../src/app";

const PSYCH_SHEET_PATH = "../data/psych-sheet/psych-sheet-3.pdf";
const MEET_INFO_PATH = "../data/psych-sheet/meet-info-3.json";

describe("full-psych-sheet-analysis", () => {
    test("full psych sheet analysis", async (done) => {
        const psychSheetLocation = resolve(__dirname, PSYCH_SHEET_PATH);
        const meetInfoLocation = resolve(__dirname, MEET_INFO_PATH);

        const outputName = resolve(__dirname, `./psych-sheet-analysis-output-${new Date().toISOString().replace(/[\/\\:]/g, "_")}.json`);
        const meetInfoString: string = readFileSync(meetInfoLocation).toString();

        await request(app).post("/analysis/psych-sheet")
            .attach("psychsheet", psychSheetLocation)
            .field("meetInfo", meetInfoString)
            .expect(200)
            .then((res) => {
                writeFileSync(outputName, JSON.stringify(JSON.parse(res.text), undefined, 4));
                done();
            }).catch((err) => {
                done(err);
            });
    });
});