import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client.ts";

type RouteContext = {
  params: {
    voteId: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "좋아요를 사용하려면 로그인해야 합니다." },
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

    const supabase = createSupabaseServerClient();

    const { data: existingLike } = await supabase
      .from("vote_likes")
      .select("vote_id")
      .eq("vote_id", voteId)
      .eq("user_id", userId)
      .single();

    let liked = true;

    if (existingLike) {
      const { error } = await supabase
        .from("vote_likes")
        .delete()
        .eq("vote_id", voteId)
        .eq("user_id", userId);

      if (error) {
        console.error(error);
        return NextResponse.json(
          { message: "좋아요 취소에 실패했습니다." },
          { status: 500 }
        );
      }

      liked = false;
    } else {
      const { error } = await supabase.from("vote_likes").insert({
        vote_id: voteId,
        user_id: userId,
      });

      if (error) {
        console.error(error);
        return NextResponse.json(
          { message: "좋아요에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ liked }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

