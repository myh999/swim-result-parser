import { resolve } from "path";
import PDFParser from "../../src/util/pdf-parser";

describe("image-converter", () => {
  test("successfully converts pdf to png", async () => {
    const inputPdf = "../../data/example0.pdf";
    const fullPath = resolve(__dirname, inputPdf);

    const parser = new PDFParser(fullPath);
    const output = await parser.getText();
    expect(output.length).not.toBe(0);
  });
});
