import { resolve } from "path";
import { getDocument } from "pdfjs-dist/es5/build/pdf.js";
import {
  PDFDocumentProxy,
  PDFPageProxy,
  TextContent,
  TextItem,
} from "pdfjs-dist/types/display/api";

const LINE_HEIGHT = 11.5;

interface TextInfo {
  text: string;
  height: number;
  width: number;
  xPos: number;
  yPos: number;
}

interface PageInfo {
  width: number;
  height: number;
  text: TextInfo[];
}

class PDFParser {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  private async getTextFromPage(doc: PDFDocumentProxy, pageNum: number): Promise<PageInfo> {
    const page: PDFPageProxy = await doc.getPage(pageNum);
    const content: TextContent = await page.getTextContent();
    const textInfo: TextInfo[] = content.items.map((item: TextItem) => {
      return {
        text: item.str,
        height: item.height,
        width: item.width,
        xPos: item.transform[4],
        yPos: item.transform[5]
      };
    });
    return {
      width: page.view[2],
      height: page.view[3],
      text: textInfo
    };
  }

  public async getText(): Promise<PageInfo[]> {
    const doc: PDFDocumentProxy = await getDocument(this.path).promise;
    const pagePromises: Promise<PageInfo>[] = [];
    for (let i = 0; i < doc.numPages; i++) {
      pagePromises.push(this.getTextFromPage(doc, i + 1));
    }

    const pages: PageInfo[] = await Promise.all(pagePromises);

    return pages;
  }
}

export default PDFParser;
