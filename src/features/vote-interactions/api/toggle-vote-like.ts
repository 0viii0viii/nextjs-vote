type ToggleVoteLikePayload = {
  voteId: string;
};

export async function toggleVoteLike({ voteId }: ToggleVoteLikePayload) {
  const response = await fetch(`/api/votes/${voteId}/like`, {
    method: "POST",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message ?? "좋아요 처리에 실패했습니다.");
  }

  return result as { liked: boolean };
}

