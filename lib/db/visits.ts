"use server";

import { eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { stats } from "@/lib/db/schema";

const KEY = "total_visits";
const COOKIE_NAME = "kz-visit";
let tableInitialized = false;

async function ensureTableExists() {
  if (tableInitialized) {
    return;
  }
  try {
    await db.run(
      sql`CREATE TABLE IF NOT EXISTS stats (key TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0)`
    );
    tableInitialized = true;
  } catch {
    /* ignore fallback */
  }
}

// Cached read — revalidates every 300s
const getVisitCountCached = unstable_cache(
  async () => {
    try {
      await ensureTableExists();
      const row = await db.select().from(stats).where(eq(stats.key, KEY)).get();
      return row?.value ?? 0;
    } catch {
      return 0;
    }
  },
  ["visit-count"],
  { revalidate: 300 }
);

export async function getVisitCount() {
  return getVisitCountCached();
}

// Server Action — called from client on mount
export async function recordVisit() {
  try {
    await ensureTableExists();
    const cookieStore = await cookies();
    const visited = cookieStore.get(COOKIE_NAME);

    if (visited) {
      return;
    }

    cookieStore.set(COOKIE_NAME, "1", {
      maxAge: THROTTLE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    await db
      .insert(stats)
      .values({ key: KEY, value: 1 })
      .onConflictDoUpdate({
        target: stats.key,
        set: { value: sql`${stats.value} + 1` },
      });
  } catch {
    /* silent fallback if DB offline */
  }
}
