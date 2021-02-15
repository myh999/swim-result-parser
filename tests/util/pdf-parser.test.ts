import PDFParser from "../../src/util/pdf-parser";

describe("image-converter", () => {
  test("successfully converts pdf to png", async () => {
    const inputPdf = "../../data/example0.pdf";
    const outputText = await PDFParser.getTextFromPDF(inputPdf);
    expect(outputText).not.toBe("");
  });
});
