import { Heart, Users2 } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import type {
  VoteFeedItem,
  VoteOptionStats,
} from "@/entities/vote/model/types.ts";
import { getCategoryLabel } from "@/shared/constants/category.ts";
import { cn } from "@/shared/lib/utils.ts";
import { Badge } from "@/shared/ui/badge.tsx";
import { Button } from "@/shared/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card.tsx";

type VoteCardProps = {
  vote: VoteFeedItem;
  onSelectOption: (optionId: string) => void;
  votePendingOptionId?: string | null;
  onToggleLike: () => void;
  likePending?: boolean;
  children?: ReactNode;
};

export function VoteCard({
  vote,
  onSelectOption,
  votePendingOptionId,
  onToggleLike,
  likePending,
  children,
}: VoteCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-2xl font-semibold">{vote.title}</CardTitle>
          <Badge variant="outline">{getCategoryLabel(vote.categoryId)}</Badge>
        </div>
        <CardDescription className="text-base text-foreground">
          {vote.content}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {vote.options
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((option) => (
              <VoteOptionRow
                key={option.id}
                option={option}
                totalParticipants={vote.totalParticipants}
                isSelected={vote.userOptionId === option.id}
                disabled={
                  Boolean(votePendingOptionId) &&
                  votePendingOptionId !== option.id &&
                  vote.userOptionId !== option.id
                }
                onSelect={() => onSelectOption(option.id)}
              />
            ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users2 className="size-4" />
            <span>
              총 참여자 {vote.totalParticipants.toLocaleString()}명 · 댓글{" "}
              {vote.commentsCount.toLocaleString()}개
            </span>
          </div>

          <Button
            type="button"
            variant={vote.isLiked ? "default" : "ghost"}
            size="sm"
            onClick={onToggleLike}
            disabled={likePending}
            className="gap-2"
          >
            <Heart
              className={cn(
                "size-4",
                vote.isLiked ? "fill-current" : undefined
              )}
            />
            {likePending ? "처리 중..." : `좋아요 ${vote.likesCount}`}
          </Button>
        </div>

        {children ? <div className="border-t pt-4">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

type VoteOptionRowProps = {
  option: VoteOptionStats;
  totalParticipants: number;
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

function VoteOptionRow({
  option,
  totalParticipants,
  isSelected,
  disabled,
  onSelect,
}: VoteOptionRowProps) {
  const percent =
    totalParticipants > 0
      ? Math.round((option.voteCount / totalParticipants) * 100)
      : 0;

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border p-4 transition hover:border-primary",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col gap-3 text-left",
          disabled && "cursor-not-allowed opacity-90"
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1 space-y-1">
            <p className="text-lg font-semibold">{option.name}</p>
            <p className="text-sm text-muted-foreground">
              {option.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xl font-bold">{percent}%</p>
              <p className="text-xs text-muted-foreground">
                {option.voteCount.toLocaleString()}명 선택
              </p>
            </div>
          </div>
        </div>

        {option.imageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image
              src={option.imageUrl}
              alt={`${option.name} 이미지`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : null}
      </button>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isSelected ? "bg-primary" : "bg-primary/60"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
