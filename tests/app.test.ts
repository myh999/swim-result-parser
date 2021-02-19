import { resolve } from "path";
import request from "supertest";
import app from "../src/app";

describe("POST /analysis/psychsheet", () => {
    test("should return 200 status", (done) => {
        const pdfPath = resolve(__dirname, "../data/psych-sheet/psych-sheet-0.pdf");
        request(app).post("/analysis/psychsheet").attach("psychsheet", pdfPath).expect(200, done);
    });
});
