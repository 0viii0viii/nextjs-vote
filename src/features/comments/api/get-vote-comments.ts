import type { VoteComment } from "@/entities/vote/model/types.ts";

type GetVoteCommentsResponse = {
  items: VoteComment[];
};

export async function getVoteComments(voteId: string) {
  const response = await fetch(`/api/votes/${voteId}/comments`);

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message ?? "댓글을 불러오지 못했습니다.");
  }

  const data = result as GetVoteCommentsResponse;
  return data.items ?? [];
}

