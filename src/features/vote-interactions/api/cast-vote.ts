type CastVotePayload = {
  voteId: string;
  optionId: string;
};

export async function castVote({ voteId, optionId }: CastVotePayload) {
  const response = await fetch(`/api/votes/${voteId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ optionId }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message ?? "투표에 실패했습니다.");
  }

  return result;
}

