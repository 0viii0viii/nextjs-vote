import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { writePostSchema } from "@/features/write-post/model/schema.ts";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client.ts";

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
