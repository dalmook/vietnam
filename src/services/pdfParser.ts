import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { ParsedLine } from "../domain/types";

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfTextItem {
  str: string;
  transform: number[];
}

interface Positioned {
  page: number;
  x: number;
  y: number;
  text: string;
}

const normalizeText = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\u0000/g, "").trim();

export const parsePdfSource = async (source: string | File) => {
  const task =
    typeof source === "string"
      ? getDocument({ url: source })
      : getDocument({ data: await source.arrayBuffer() });

  const pdf = await task.promise;
  const collected: Positioned[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    content.items.forEach((item) => {
      const textItem = item as PdfTextItem;
      const text = normalizeText(textItem.str);
      if (!text) {
        return;
      }

      collected.push({
        page: pageNumber,
        x: textItem.transform[4],
        y: textItem.transform[5],
        text
      });
    });
  }

  return mergeIntoLines(collected);
};

const mergeIntoLines = (items: Positioned[]): ParsedLine[] => {
  const pages = new Map<number, Positioned[]>();
  items.forEach((item) => {
    const pageItems = pages.get(item.page);
    if (pageItems) {
      pageItems.push(item);
    } else {
      pages.set(item.page, [item]);
    }
  });

  const lines: ParsedLine[] = [];

  pages.forEach((pageItems, page) => {
    const rows: Positioned[][] = [];

    pageItems
      .sort((a, b) => b.y - a.y || a.x - b.x)
      .forEach((item) => {
        const target = rows.find((row) => Math.abs(row[0].y - item.y) < 3);
        if (target) {
          target.push(item);
        } else {
          rows.push([item]);
        }
      });

    rows.forEach((row, index) => {
      const text = row
        .sort((a, b) => a.x - b.x)
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text.length < 2) {
        return;
      }

      lines.push({
        id: `page-${page}-line-${index}`,
        page,
        text
      });
    });
  });

  return lines;
};
