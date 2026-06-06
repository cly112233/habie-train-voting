// ===== 用户 =====
export interface User {
  id: string;
  username: string;
  bio: string;
  created_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

// ===== 周期 =====
export type CycleType = "character" | "modifier";
export type CyclePhase = "submission" | "voting" | "results";

export interface Cycle {
  id: number;
  type: CycleType;
  start_date: string;
  submission_end_date: string;
  voting_start_date: string;
  voting_end_date: string;
  created_at: string;
}

export interface CycleStatus {
  cycle: Cycle | null;
  phase: CyclePhase;
  isOpen: boolean; // 投稿是否开启
  isVoting: boolean; // 投票是否开启
  previousCycle: Cycle | null;
}

// ===== 角色投稿 =====
export type CharacterRole =
  | "平民"
  | "警长"
  | "特殊中立"
  | "杀手方中立"
  | "杀手";

export const CHARACTER_ROLES: CharacterRole[] = [
  "平民",
  "警长",
  "特殊中立",
  "杀手方中立",
  "杀手",
];

export interface Character {
  id: number;
  user_id: string;
  cycle_id: number;
  name: string;
  role: CharacterRole;
  short_desc: string;
  description: string;
  shop: string;
  story: string;
  created_at: string;
  is_resubmit: number;
  // 关联数据
  username?: string;
  like_count?: number;
  dislike_count?: number;
  vote_count?: number;
  user_reaction?: "like" | "dislike" | null;
  user_voted?: boolean;
}

// ===== 修饰符投稿 =====
export interface Modifier {
  id: number;
  user_id: string;
  cycle_id: number;
  name: string;
  description: string;
  story: string;
  created_at: string;
  is_resubmit: number;
  // 关联数据
  username?: string;
  like_count?: number;
  dislike_count?: number;
  vote_count?: number;
  user_reaction?: "like" | "dislike" | null;
  user_voted?: boolean;
}

// ===== 投票 =====
export interface Vote {
  id: number;
  user_id: string;
  submission_type: CycleType;
  submission_id: number;
  cycle_id: number;
  created_at: string;
}

// ===== 反应（点赞/踩） =====
export interface Reaction {
  id: number;
  user_id: string;
  submission_type: CycleType;
  submission_id: number;
  reaction: "like" | "dislike";
  created_at: string;
}

// ===== 建议 =====
export interface Suggestion {
  id: number;
  user_id: string;
  submission_type: CycleType;
  submission_id: number;
  content: string;
  created_at: string;
  username?: string;
}

// ===== 排名 =====
export interface RankingItem {
  submission_id: number;
  name: string;
  username: string;
  vote_count: number;
  rank: number;
}

// ===== 用户主页 =====
export interface ProfileData {
  user: User;
  characters: (Character & { rank: number | null; cycle_label: string })[];
  modifiers: (Modifier & { rank: number | null; cycle_label: string })[];
}

// ===== API 响应 =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===== 投稿表单输入 =====
export interface CharacterInput {
  name: string;
  role: CharacterRole;
  short_desc: string;
  description: string;
  shop?: string;
  story?: string;
}

export interface ModifierInput {
  name: string;
  description: string;
  story?: string;
}

// ===== 登录/注册表单 =====
export interface LoginInput {
  id: string;
  password: string;
}

export interface RegisterInput {
  id: string;
  username: string;
  password: string;
  bio: string;
}
