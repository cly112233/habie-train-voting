import type { CycleStatus } from "@/types";

interface CycleStatusBannerProps {
  status: CycleStatus;
}

function getCharacterPhaseText(status: CycleStatus): string {
  if (status.isOpen) {
    return `📝 投稿开放中 — 截止至 ${status.cycle?.submission_end_date}`;
  }
  if (status.isVoting) {
    return `🗳️ 投票进行中 — ${status.cycle?.voting_start_date} ~ ${status.cycle?.voting_end_date}，请前往投票页参与`;
  }
  return `📋 本期已结束，等待下一周期`;
}

function getModifierPhaseText(status: CycleStatus): string {
  if (status.isOpen) {
    return `📝 投稿开放中 — 截止至 ${status.cycle?.submission_end_date}`;
  }
  if (status.isVoting) {
    return `🗳️ 投票进行中 — ${status.cycle?.voting_start_date} ~ ${status.cycle?.voting_end_date}，请前往投票页参与`;
  }
  return `📋 本期已结束，等待下一周期`;
}

export default function CycleStatusBanner({ status }: CycleStatusBannerProps) {
  const typeLabel = status.cycle?.type === "character" ? "角色" : "修饰符";

  const text =
    status.cycle?.type === "character"
      ? getCharacterPhaseText(status)
      : getModifierPhaseText(status);

  const bgColor = status.isOpen
    ? "bg-green-50 border-green-200 text-green-800"
    : status.isVoting
    ? "bg-accent-light border-indigo-200 text-indigo-800"
    : "bg-gray-50 border-gray-200 text-gray-600";

  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${bgColor}`}>
      <div className="flex items-center gap-2">
        <span className="font-medium">
          【{typeLabel}周期】{status.cycle?.start_date} ~ {status.cycle?.voting_end_date}
        </span>
      </div>
      <div className="mt-1">{text}</div>
    </div>
  );
}
