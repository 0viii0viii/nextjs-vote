import type { VoteFeedItem } from "@/entities/vote/model/types.ts";

type GetVotesParams = {
  cursor?: string | null;
  categoryId?: string;
  limit?: number;
};

type GetVotesResponse = {
  items: VoteFeedItem[];
  nextCursor: string | null;
};

export async function getVotes({
  cursor,
  categoryId,
  limit,
}: GetVotesParams): Promise<GetVotesResponse> {
  const searchParams = new URLSearchParams();

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  if (categoryId) {
    searchParams.set("categoryId", categoryId);
  }

  if (limit) {
    searchParams.set("limit", String(limit));
  }

  const query = searchParams.toString();
  const response = await fetch(`/api/votes${query ? `?${query}` : ""}`);

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message ?? "투표 목록을 불러오지 못했습니다.");
  }

  const result = (await response.json()) as GetVotesResponse;
  return {
    items: result.items ?? [],
    nextCursor: result.nextCursor ?? null,
  };
}

