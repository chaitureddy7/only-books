/**
 * bookId -> Set of userIds who have that book on their READ shelf, scoped to
 * one candidate pool (a city + intent/gender-compatible bucket).
 *
 * Books owned by more than `popularBookCap` users are dropped from the index
 * so a bestseller doesn't turn candidate discovery into a near-complete
 * pairwise scan. Those books still count toward a pair's Jaccard score once
 * the pair already qualifies via a rarer shared book.
 */
export function buildInvertedIndex(
  readBooksByUser: Map<string, Set<string>>,
  popularBookCap: number
): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  for (const [userId, bookIds] of readBooksByUser) {
    for (const bookId of bookIds) {
      let owners = index.get(bookId);
      if (!owners) {
        owners = new Set();
        index.set(bookId, owners);
      }
      owners.add(userId);
    }
  }

  for (const [bookId, owners] of index) {
    if (owners.size > popularBookCap) index.delete(bookId);
  }

  return index;
}

/** userId -> number of books shared with `userId`, for pairs meeting minOverlap. */
export function findCandidates(
  userId: string,
  userReadBookIds: Set<string>,
  index: Map<string, Set<string>>,
  minOverlap: number
): Map<string, number> {
  const overlapCounts = new Map<string, number>();

  for (const bookId of userReadBookIds) {
    const owners = index.get(bookId);
    if (!owners) continue;
    for (const otherUserId of owners) {
      if (otherUserId === userId) continue;
      overlapCounts.set(otherUserId, (overlapCounts.get(otherUserId) ?? 0) + 1);
    }
  }

  for (const [otherUserId, count] of overlapCounts) {
    if (count < minOverlap) overlapCounts.delete(otherUserId);
  }

  return overlapCounts;
}
