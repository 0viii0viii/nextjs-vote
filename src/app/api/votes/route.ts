import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { writePostSchema } from "@/features/write-post/model/schema.ts";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client.ts";

const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 5;
const MAX_LIMIT = 20;

type RpcVoteRow = {
  vote_id: string;
  title: string;
  content: string;
  category_id: string;
  created_at: string;
  author_id: string;
  total_participants: number;
  user_option_id: string | null;
  is_liked: boolean;
  likes_count: number;
  comments_count: number;
  options: Array<{
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    displayOrder: number;
    voteCount: number;
  }>;
};

function decodeCursor(cursorParam: string | null) {
  if (!cursorParam) {
    return {
      createdAt: null as string | null,
      voteId: null as string | null,
    };
  }

  try {
    const decoded = Buffer.from(cursorParam, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as {
      createdAt?: string;
      voteId?: string;
    };

    if (parsed?.createdAt && parsed?.voteId) {
      return {
        createdAt: parsed.createdAt,
        voteId: parsed.voteId,
      };
    }
  } catch {
    // ignore malformed cursor
  }

  return {
    createdAt: null,
    voteId: null,
  };
}

function encodeCursor(payload: { createdAt: string; voteId: string }) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, MIN_LIMIT), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const cursorParam = searchParams.get("cursor");
    const categoryIdParam = searchParams.get("categoryId");

    const { createdAt: cursorCreatedAt, voteId: cursorVoteId } =
      decodeCursor(cursorParam);

    const categoryFilter =
      categoryIdParam && categoryIdParam !== "all" ? categoryIdParam : null;

    const { userId } = await auth();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_votes_feed", {
      p_limit: limit + 1,
      p_cursor_created_at: cursorCreatedAt,
      p_cursor_id: cursorVoteId,
      p_category_id: categoryFilter,
      p_user_id: userId ?? null,
    });

    if (error) {
      console.error("Failed to fetch votes:", error);
      return NextResponse.json(
        { message: "투표 목록을 가져오지 못했습니다." },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as RpcVoteRow[];
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    const nextCursor =
      hasMore && items.length > 0
        ? encodeCursor({
            createdAt: items[items.length - 1].created_at,
            voteId: items[items.length - 1].vote_id,
          })
        : null;

    const normalized = items.map((item) => ({
      id: item.vote_id,
      title: item.title,
      content: item.content,
      categoryId: item.category_id,
      createdAt: item.created_at,
      authorId: item.author_id,
      totalParticipants: item.total_participants,
      userOptionId: item.user_option_id,
      isLiked: item.is_liked,
      likesCount: item.likes_count,
      commentsCount: item.comments_count,
      options: Array.isArray(item.options)
        ? item.options.map((option) => ({
            id: option.id,
            name: option.name,
            description: option.description,
            imageUrl: option.imageUrl,
            displayOrder: option.displayOrder,
            voteCount: option.voteCount,
          }))
        : [],
    }));

    return NextResponse.json({
      items: normalized,
      nextCursor,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "투표 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = writePostSchema.parse(payload);

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Clerk 인증 정보를 확인할 수 없습니다." },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .insert({
        title: data.title,
        content: data.content,
        category_id: data.categoryId,
        user_id: userId,
      })
      .select("id")
      .single();

    if (voteError || !vote) {
      throw voteError ?? new Error("투표 생성에 실패했습니다.");
    }

    const optionRows = data.options.map((option, index) => ({
      vote_id: vote.id,
      name: option.name,
      description: option.description,
      display_order: index,
      image_url: option.imageUrl || null,
    }));

    const { error: optionError } = await supabase
      .from("vote_options")
      .insert(optionRows);

    if (optionError) {
      throw optionError;
    }

    return NextResponse.json(
      { voteId: vote.id, message: "투표가 생성되었습니다." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "유효하지 않은 입력입니다.", issues: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error(error);

    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
