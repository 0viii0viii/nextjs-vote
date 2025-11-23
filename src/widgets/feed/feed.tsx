"use client";
import { useEffect, useRef } from "react";

import { VoteCard } from "@/entities/vote/ui/vote-card.tsx";
import { VoteComments } from "@/features/comments/ui/vote-comments.tsx";
import { CategoryFilter } from "@/features/feed-filter/ui/category-filter.tsx";
import { useVoteFeed } from "@/features/vote-feed/model/use-vote-feed.ts";
import { Skeleton } from "@/shared/ui/skeleton.tsx";

export function Feed() {
  const {
    categoryId,
    setCategoryId,
    votes,
    isInitialLoading,
    isFetchingMore,
    hasMore,
    fetchMore,
    handleSelectOption,
    handleToggleLike,
    handleCommentAdded,
    votePending,
    likePendingId,
  } = useVoteFeed();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetchingMore) {
          void fetchMore();
        }
      },
      { threshold: 0.5 }
    );

    const current = sentinelRef.current;
    observer.observe(current);

    return () => {
      observer.unobserve(current);
    };
  }, [fetchMore, hasMore, isFetchingMore]);

  const isVotePending = (voteId: string) =>
    votePending && votePending.voteId === voteId ? votePending.optionId : null;

  return (
    <section className="space-y-6">
      <CategoryFilter value={categoryId} onChange={setCategoryId} />

      {isInitialLoading && votes.length === 0 ? (
        <FeedSkeleton />
      ) : votes.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          아직 등록된 투표가 없습니다. 첫 번째 투표를 만들어보세요!
        </div>
      ) : (
        <div className="space-y-6">
          {votes.map((vote) => (
            <VoteCard
              key={vote.id}
              vote={vote}
              onSelectOption={(optionId) =>
                handleSelectOption(vote.id, optionId)
              }
              votePendingOptionId={isVotePending(vote.id)}
              onToggleLike={() => handleToggleLike(vote.id)}
              likePending={likePendingId === vote.id}
            >
              <VoteComments
                voteId={vote.id}
                commentsCount={vote.commentsCount}
                onCommentAdded={() => handleCommentAdded(vote.id)}
              />
            </VoteCard>
          ))}
        </div>
      )}

      <div ref={sentinelRef} />

      {isFetchingMore ? (
        <p className="text-center text-sm text-muted-foreground">
          불러오는 중...
        </p>
      ) : null}

      {!hasMore && votes.length > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          모든 투표를 확인했습니다.
        </p>
      ) : null}
    </section>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ))}
    </div>
  );
}
