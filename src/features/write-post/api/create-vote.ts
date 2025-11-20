import type { WritePostFormValues } from "@/features/write-post/model/schema.ts";

type CreateVotePayload = WritePostFormValues;

export async function createVote(payload: CreateVotePayload) {
  const response = await fetch("/api/votes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message ?? "투표 생성에 실패했습니다.");
  }

  return result;
}
