"use client";
import { useCallback, useEffect, useState } from "react";

import type { VoteFeedItem } from "@/entities/vote/model/types.ts";
import { getVotes } from "@/features/vote-feed/api/get-votes.ts";
import { castVote } from "@/features/vote-interactions/api/cast-vote.ts";
import { toggleVoteLike } from "@/features/vote-interactions/api/toggle-vote-like.ts";

const PAGE_SIZE = 10;

export function useVoteFeed() {
  const [categoryId, setCategoryId] = useState("all");
  const [votes, setVotes] = useState<VoteFeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [votePending, setVotePending] = useState<{
    voteId: string;
    optionId: string;
  } | null>(null);
  const [likePendingId, setLikePendingId] = useState<string | null>(null);

  const fetchInitial = useCallback(async () => {
    setIsInitialLoading(true);
    setHasMore(true);
    setCursor(null);
    setVotes([]);
    try {
      const { items, nextCursor } = await getVotes({
        categoryId,
        limit: PAGE_SIZE,
      });
      setVotes(items);
      setCursor(nextCursor);
      setHasMore(Boolean(nextCursor));
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void fetchInitial();
  }, [categoryId, fetchInitial]);

  const fetchMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || !cursor) {
      return;
    }

    setIsFetchingMore(true);
    try {
      const { items, nextCursor } = await getVotes({
        categoryId,
        limit: PAGE_SIZE,
        cursor,
      });
      setVotes((prev) => [...prev, ...items]);
      setCursor(nextCursor);
      setHasMore(Boolean(nextCursor));
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [categoryId, cursor, hasMore, isFetchingMore]);

  const handleSelectOption = useCallback(
    async (voteId: string, optionId: string) => {
      setVotePending({ voteId, optionId });
      try {
        await castVote({ voteId, optionId });
        setVotes((prev) =>
          prev.map((vote) => {
            if (vote.id !== voteId) {
              return vote;
            }

            const previousOptionId = vote.userOptionId;
            const updatedOptions = vote.options.map((option) => {
              let voteCount = option.voteCount;

              if (
                option.id === previousOptionId &&
                previousOptionId !== optionId
              ) {
                voteCount = Math.max(0, voteCount - 1);
              }

              if (option.id === optionId) {
                if (previousOptionId === optionId) {
                  return option;
                }
                voteCount += 1;
              }

              return {
                ...option,
                voteCount,
              };
            });

            const totalParticipants =
              vote.totalParticipants + (previousOptionId ? 0 : 1);

            return {
              ...vote,
              userOptionId: optionId,
              options: updatedOptions,
              totalParticipants,
            };
          })
        );
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setVotePending(null);
      }
    },
    []
  );

  const handleToggleLike = useCallback(async (voteId: string) => {
    setLikePendingId(voteId);
    try {
      const { liked } = await toggleVoteLike({ voteId });
      setVotes((prev) =>
        prev.map((vote) =>
          vote.id === voteId
            ? {
                ...vote,
                isLiked: liked,
                likesCount: liked
                  ? vote.likesCount + 1
                  : Math.max(vote.likesCount - 1, 0),
              }
            : vote
        )
      );
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLikePendingId(null);
    }
  }, []);

  const handleCommentAdded = useCallback((voteId: string) => {
    setVotes((prev) =>
      prev.map((vote) =>
        vote.id === voteId
          ? {
              ...vote,
              commentsCount: vote.commentsCount + 1,
            }
          : vote
      )
    );
  }, []);

  return {
    categoryId,
    setCategoryId,
    votes,
    hasMore,
    isInitialLoading,
    isFetchingMore,
    fetchMore,
    handleSelectOption,
    handleToggleLike,
    handleCommentAdded,
    votePending,
    likePendingId,
    refetch: fetchInitial,
  };
}
