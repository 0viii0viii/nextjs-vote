import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client.ts";

const votePayloadSchema = z.object({
  optionId: z.string().uuid(),
});

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
        { message: "투표를 진행하려면 로그인이 필요합니다." },
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
    const { optionId } = votePayloadSchema.parse(payload);

    const supabase = createSupabaseServerClient();

    const { data: option, error: optionError } = await supabase
      .from("vote_options")
      .select("vote_id")
      .eq("id", optionId)
      .single();

    if (optionError || !option || option.vote_id !== voteId) {
      return NextResponse.json(
        { message: "선택한 옵션 정보를 확인할 수 없습니다." },
        { status: 400 }
      );
    }

    const { error: upsertError } = await supabase
      .from("vote_participants")
      .upsert(
        {
          vote_id: voteId,
          option_id: optionId,
          user_id: userId,
        },
        {
          onConflict: "vote_id,user_id",
        }
      );

    if (upsertError) {
      console.error(upsertError);
      return NextResponse.json(
        { message: "투표 반영에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "투표가 반영되었습니다.", optionId },
      { status: 200 }
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
