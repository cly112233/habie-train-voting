import { getDb } from "./db";
import type { Cycle, CycleStatus, CycleType, CyclePhase } from "@/types";

// 第一个周期的起始日：2026年6月1日（周一）
const REFERENCE_START = "2026-06-01";

/**
 * 手动解析 YYYY-MM-DD 避免时区问题
 */
function parseDate(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m: m - 1, d }; // JS month is 0-indexed
}

/**
 * 获取今天的日期字符串（中国时区 UTC+8）
 */
function getToday(): string {
  // 使用 UTC 时间 + 8 小时得到北京时间
  const now = new Date();
  const chinaMs = now.getTime() + 8 * 60 * 60 * 1000;
  const d = new Date(chinaMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 日期加法：dateStr + days 天 → 返回 YYYY-MM-DD
 */
function addDays(dateStr: string, days: number): string {
  const { y, m, d } = parseDate(dateStr);
  const date = new Date(Date.UTC(y, m, d + days));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * 计算两个日期之间的天数差 d2 - d1
 */
function dayDiff(d1: string, d2: string): number {
  const p1 = parseDate(d1);
  const p2 = parseDate(d2);
  const t1 = Date.UTC(p1.y, p1.m, p1.d);
  const t2 = Date.UTC(p2.y, p2.m, p2.d);
  return Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
}

/**
 * 获取或创建当前周期
 */
function getOrCreateCycle(type: CycleType, cycleStartDate: string): Cycle {
  const db = getDb();

  let cycle = db
    .prepare("SELECT * FROM cycles WHERE type = ? AND start_date = ?")
    .get(type, cycleStartDate) as Cycle | undefined;

  if (!cycle) {
    const cycleLength = type === "character" ? 14 : 7;
    const submissionDays = type === "character" ? 12 : 5;

    const submissionEnd = addDays(cycleStartDate, submissionDays - 1);
    const votingStart = addDays(cycleStartDate, submissionDays);
    const votingEnd = addDays(cycleStartDate, cycleLength - 1);

    const result = db
      .prepare(
        `INSERT INTO cycles (type, start_date, submission_end_date, voting_start_date, voting_end_date)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(type, cycleStartDate, submissionEnd, votingStart, votingEnd);

    cycle = db
      .prepare("SELECT * FROM cycles WHERE id = ?")
      .get(result.lastInsertRowid) as Cycle;
  }

  return cycle;
}

/**
 * 计算某个类型当前所处的周期号（从参考日期开始计数）
 */
function getCycleNumber(type: CycleType, fromDate: string): number {
  const daysSinceRef = dayDiff(REFERENCE_START, fromDate);
  const cycleLength = type === "character" ? 14 : 7;
  return Math.floor(daysSinceRef / cycleLength);
}

/**
 * 获取周期的起始日
 */
function getCycleStartDate(type: CycleType, cycleNumber: number): string {
  const cycleLength = type === "character" ? 14 : 7;
  return addDays(REFERENCE_START, cycleNumber * cycleLength);
}

/**
 * 获取前一个周期的起始日
 */
function getPreviousCycleStartDate(type: CycleType, cycleNumber: number): string {
  if (cycleNumber <= 0) return REFERENCE_START;
  return getCycleStartDate(type, cycleNumber - 1);
}

/**
 * 判断当前周期状态
 */
export function getCycleStatus(type: CycleType): CycleStatus {
  const today = getToday();
  const cycleNumber = getCycleNumber(type, today);
  const cycleStartDate = getCycleStartDate(type, cycleNumber);
  const cycle = getOrCreateCycle(type, cycleStartDate);

  // 判断阶段
  let phase: CyclePhase;
  let isOpen: boolean;
  let isVoting: boolean;

  if (today <= cycle.submission_end_date) {
    phase = "submission";
    isOpen = true;
    isVoting = false;
  } else if (today >= cycle.voting_start_date && today <= cycle.voting_end_date) {
    phase = "voting";
    isOpen = false;
    isVoting = true;
  } else {
    phase = "results";
    isOpen = false;
    isVoting = false;
  }

  // 获取上一个周期（仅在周期号 > 0 时有效）
  let previousCycle: Cycle | null = null;
  if (cycleNumber > 0) {
    const prevStartDate = getPreviousCycleStartDate(type, cycleNumber);
    if (prevStartDate !== cycleStartDate) {
      try {
        previousCycle = getDb()
          .prepare("SELECT * FROM cycles WHERE type = ? AND start_date = ?")
          .get(type, prevStartDate) as Cycle | null;
      } catch {
        previousCycle = null;
      }
    }
  }

  return { cycle, phase, isOpen, isVoting, previousCycle };
}

/**
 * 获取某个周期的排名
 */
export function getCycleRanking(
  type: CycleType,
  cycleId: number
): { submission_id: number; vote_count: number }[] {
  const db = getDb();
  const table = type === "character" ? "characters" : "modifiers";

  const rankings = db
    .prepare(
      `SELECT v.submission_id, COUNT(*) as vote_count
       FROM votes v
       JOIN ${table} s ON v.submission_id = s.id
       WHERE v.submission_type = ? AND v.cycle_id = ? AND s.cycle_id = ?
       GROUP BY v.submission_id
       ORDER BY vote_count DESC`
    )
    .all(type, cycleId, cycleId) as { submission_id: number; vote_count: number }[];

  return rankings;
}

/**
 * 获取投稿在某个周期内的排名
 */
export function getSubmissionRank(
  type: CycleType,
  cycleId: number,
  submissionId: number
): number | null {
  const rankings = getCycleRanking(type, cycleId);
  const idx = rankings.findIndex((r) => r.submission_id === submissionId);
  return idx === -1 ? null : idx + 1;
}
