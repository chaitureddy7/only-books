import Papa from "papaparse";
import { cleanIsbn } from "@/lib/csv/bookIdentity";

export const REQUIRED_HEADERS = ["Title", "Author", "Exclusive Shelf"] as const;

export type ParsedShelf = "READ" | "CURRENTLY_READING" | "TO_READ" | "OTHER";

export interface ParsedGoodreadsRow {
  title: string;
  author: string;
  isbn: string | null;
  myRating: number | null;
  avgRating: number | null;
  numPages: number | null;
  yearPublished: number | null;
  dateRead: Date | null;
  dateAdded: Date | null;
  bookshelves: string[];
  exclusiveShelf: ParsedShelf;
}

export interface ParseGoodreadsResult {
  rows: ParsedGoodreadsRow[];
  totalRows: number;
  skippedRows: number;
  missingHeaders: string[];
}

function toFloat(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function toInt(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function toDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toExclusiveShelf(raw: string | undefined): ParsedShelf {
  switch ((raw ?? "").trim().toLowerCase()) {
    case "read":
      return "READ";
    case "currently-reading":
      return "CURRENTLY_READING";
    case "to-read":
      return "TO_READ";
    default:
      return "OTHER";
  }
}

function toBookshelves(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  for (const shelf of raw.split(",")) {
    const trimmed = shelf.trim().toLowerCase();
    if (trimmed) seen.add(trimmed);
  }
  return Array.from(seen);
}

export function parseGoodreadsCsv(csvText: string): ParseGoodreadsResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields ?? [];
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return { rows: [], totalRows: 0, skippedRows: 0, missingHeaders };
  }

  const rows: ParsedGoodreadsRow[] = [];
  let skippedRows = 0;

  for (const raw of parsed.data) {
    const title = raw["Title"]?.trim();
    const author = raw["Author"]?.trim();
    if (!title || !author) {
      skippedRows += 1;
      continue;
    }

    const myRatingRaw = toInt(raw["My Rating"]);

    rows.push({
      title,
      author,
      isbn: cleanIsbn(raw["ISBN"]) ?? cleanIsbn(raw["ISBN13"]),
      myRating: myRatingRaw && myRatingRaw > 0 ? myRatingRaw : null,
      avgRating: toFloat(raw["Average Rating"]),
      numPages: toInt(raw["Number of Pages"]),
      yearPublished: toInt(raw["Year Published"]),
      dateRead: toDate(raw["Date Read"]),
      dateAdded: toDate(raw["Date Added"]),
      bookshelves: toBookshelves(raw["Bookshelves"]),
      exclusiveShelf: toExclusiveShelf(raw["Exclusive Shelf"]),
    });
  }

  return { rows, totalRows: parsed.data.length, skippedRows, missingHeaders: [] };
}
