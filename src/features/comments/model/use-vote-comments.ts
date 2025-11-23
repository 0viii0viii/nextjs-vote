"use client";
import { useCallback, useState } from "react";

import type { VoteComment } from "@/entities/vote/model/types.ts";
import { createVoteComment } from "@/features/comments/api/create-vote-comment.ts";
import { getVoteComments } from "@/features/comments/api/get-vote-comments.ts";

export function useVoteComments(voteId: string) {
  const [comments, setComments] = useState<VoteComment[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const items = await getVoteComments(voteId);
      setComments(items);
      setHasLoaded(true);
    } catch (loadError) {
      if (loadError instanceof Error) {
        setError(loadError.message);
      } else {
        setError("댓글을 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, voteId]);

  const addComment = useCallback(
    async (content: string) => {
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const comment = await createVoteComment({ voteId, content });
        setComments((prev) => [...prev, comment]);
      } catch (submitError) {
        if (submitError instanceof Error) {
          setError(submitError.message);
        } else {
          setError("댓글 작성에 실패했습니다.");
        }
        throw submitError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, voteId]
  );

  return {
    comments,
    hasLoaded,
    isLoading,
    isSubmitting,
    error,
    loadComments,
    addComment,
  };
}
