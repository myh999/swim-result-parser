import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import PDFParser from "../../src/util/pdf-parser";

describe("pdf-converter", () => {
  const LOG_PATH = "log/pdf-parser-test.json";
  test("successfully converts pdf to meet data", async () => {
    const inputPdf = "../../data/example0.pdf";
    const fullPath = resolve(__dirname, inputPdf);

    const rawConfig = readFileSync(resolve(__dirname, "../../data/config0.json"));
    const config = JSON.parse(rawConfig.toString());

    const parser = new PDFParser(config, fullPath);
    const output = await parser.getText();
    writeFileSync(LOG_PATH, JSON.stringify(output));
    expect(output.eventEntries.length).not.toBe(0);
  });
});
