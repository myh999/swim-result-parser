import { resolve } from "path";
import { getDocument } from "pdfjs-dist/es5/build/pdf.js";
import {
  PDFDocumentProxy,
  PDFPageProxy,
  TextContent,
  TextItem,
} from "pdfjs-dist/types/display/api";

const LINE_HEIGHT = 11.5;

class PDFParser {

  public static async getTextFromPDF(path: string): Promise<string> {
    const fullPath = resolve(__dirname, path);

    const doc: PDFDocumentProxy = await getDocument(fullPath).promise;
    const page: PDFPageProxy = await doc.getPage(2);
    const content: TextContent = await page.getTextContent();
    const stringArray = [];

    content.items.forEach((item: TextItem) => {
      stringArray.push(item.str + " " + item.transform[4] + " " + item.transform[5]);
    });

    return stringArray.join("\n");
  }
}

export default PDFParser;
