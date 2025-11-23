import type { VoteComment } from "@/entities/vote/model/types.ts";

type CreateVoteCommentPayload = {
  voteId: string;
  content: string;
};

type CreateVoteCommentResponse = {
  comment: VoteComment;
};

export async function createVoteComment({
  voteId,
  content,
}: CreateVoteCommentPayload) {
  const response = await fetch(`/api/votes/${voteId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message ?? "댓글 작성에 실패했습니다.");
  }

  const data = result as CreateVoteCommentResponse;
  return data.comment;
}

