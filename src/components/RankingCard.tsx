interface RankingCardProps {
  rank: number;
  name: string;
  username: string;
  voteCount: number;
  isFirst?: boolean;
}

export default function RankingCard({ rank, name, username, voteCount, isFirst }: RankingCardProps) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
  const bgClass =
    rank === 1
      ? "bg-yellow-50 border-yellow-200"
      : rank === 2
      ? "bg-gray-50 border-gray-200"
      : rank === 3
      ? "bg-orange-50 border-orange-200"
      : "bg-white border-border";

  return (
    <div className={`rounded-2xl border ${bgClass} p-4 flex items-center gap-4`}>
      <div className="text-2xl shrink-0 w-10 text-center">{medal}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{name}</h4>
        <p className="text-xs text-muted">作者：{username}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-lg font-bold text-accent">{voteCount}</span>
        <span className="text-xs text-muted ml-1">票</span>
      </div>
    </div>
  );
}
