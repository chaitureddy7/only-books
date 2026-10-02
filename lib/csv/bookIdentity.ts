import type { Book, PrismaClient } from "@prisma/client";

/**
 * Goodreads exports ISBN/ISBN13 wrapped as an Excel formula, e.g. `="0765326353"`,
 * to stop spreadsheet apps from mangling leading zeros / treating it as a number.
 */
export function cleanIsbn(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const stripped = raw.trim().replace(/^="?(.*?)"?$/, "$1").replace(/"/g, "").trim();
  return stripped.length > 0 ? stripped : null;
}

export function normalizeKey(title: string, author: string): string {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  return `${norm(title)}|${norm(author)}`;
}

interface BookRow {
  title: string;
  author: string;
  isbn: string | null;
  avgRating: number | null;
  numPages: number | null;
  yearPublished: number | null;
}

/**
 * Resolves a CSV row to a single shared Book row, trying ISBN first and
 * falling back to the normalized title+author key. Without this fallback,
 * the same physical book would fragment into two Book rows whenever one
 * upload has an ISBN for it and another doesn't (a real, common case across
 * different Goodreads exports) — silently breaking overlap-based matching
 * between those two users.
 */
export async function findOrCreateBook(prisma: PrismaClient, row: BookRow): Promise<Book> {
  if (row.isbn) {
    const byIsbn = await prisma.book.findUnique({ where: { isbn: row.isbn } });
    if (byIsbn) return byIsbn;
  }

  const normalizedKey = normalizeKey(row.title, row.author);
  const byKey = await prisma.book.findUnique({ where: { normalizedKey } });
  if (byKey) {
    if (row.isbn && !byKey.isbn) {
      return prisma.book.update({ where: { id: byKey.id }, data: { isbn: row.isbn } });
    }
    return byKey;
  }

  return prisma.book.create({
    data: {
      isbn: row.isbn,
      normalizedKey,
      title: row.title,
      author: row.author,
      avgRating: row.avgRating,
      numPages: row.numPages,
      yearPublished: row.yearPublished,
    },
  });
}
