import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client.ts";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력하세요.")
    .max(500, "댓글은 500자 이하로 입력하세요."),
});

type RouteContext = {
  params: {
    voteId: string;
  };
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const voteId = context.params.voteId;
    if (!voteId) {
      return NextResponse.json(
        { message: "투표 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("vote_comments")
      .select("id, content, user_id, created_at")
      .eq("vote_id", voteId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: "댓글을 불러오지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        items: (data ?? []).map((comment) => ({
          id: comment.id,
          content: comment.content,
          userId: comment.user_id,
          createdAt: comment.created_at,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "댓글 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "댓글을 작성하려면 로그인해야 합니다." },
        { status: 401 }
      );
    }

    const voteId = context.params.voteId;
    if (!voteId) {
      return NextResponse.json(
        { message: "투표 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const payload = await request.json();
    const data = commentSchema.parse(payload);

    const supabase = createSupabaseServerClient();

    const { data: comment, error } = await supabase
      .from("vote_comments")
      .insert({
        vote_id: voteId,
        user_id: userId,
        content: data.content,
      })
      .select("id, content, user_id, created_at")
      .single();

    if (error || !comment) {
      console.error(error);
      return NextResponse.json(
        { message: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          content: comment.content,
          userId: comment.user_id,
          createdAt: comment.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "유효하지 않은 요청입니다.", issues: error.flatten() },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

