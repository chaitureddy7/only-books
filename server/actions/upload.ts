"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseGoodreadsCsv } from "@/lib/csv/parseGoodreads";
import { findOrCreateBook } from "@/lib/csv/bookIdentity";
import { incrementCityCount } from "@/lib/unlock/cityUnlock";
import { computeMatchesForUser } from "@/lib/matching/engine";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface UploadFormState {
  error?: string;
}

export async function uploadGoodreadsCsv(_prevState: UploadFormState, formData: FormData): Promise<UploadFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.profileCompletedAt) redirect("/onboarding/profile");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file to upload" };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "File is too large (max 5MB)" };
  }

  const text = await file.text();
  const { rows, skippedRows, missingHeaders } = parseGoodreadsCsv(text);

  if (missingHeaders.length > 0) {
    return { error: `This doesn't look like a Goodreads export — missing columns: ${missingHeaders.join(", ")}` };
  }
  if (rows.length === 0) {
    return { error: "No valid rows found in this file" };
  }

  for (const row of rows) {
    const book = await findOrCreateBook(prisma, row);

    await prisma.userBook.upsert({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
      create: {
        userId: user.id,
        bookId: book.id,
        myRating: row.myRating,
        dateRead: row.dateRead,
        dateAdded: row.dateAdded,
        exclusiveShelf: row.exclusiveShelf,
        bookshelves: row.bookshelves,
      },
      update: {
        myRating: row.myRating,
        dateRead: row.dateRead,
        dateAdded: row.dateAdded,
        exclusiveShelf: row.exclusiveShelf,
        bookshelves: row.bookshelves,
      },
    });
  }

  const wasAlreadyUploaded = user.csvUploadedAt != null;
  await prisma.user.update({ where: { id: user.id }, data: { csvUploadedAt: new Date() } });

  if (!wasAlreadyUploaded && user.city && user.gender) {
    await incrementCityCount(user.city, user.gender);
  }

  await computeMatchesForUser(user.id);

  redirect(`/onboarding/summary?imported=${rows.length}&skipped=${skippedRows}`);
}
