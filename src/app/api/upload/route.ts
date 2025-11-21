import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server-client.ts";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "파일이 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "파일 크기는 5MB를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "지원되지 않는 파일 형식입니다." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // 고유한 파일명 생성
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `options/${fileName}`;

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from("vote-options")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { message: "파일 업로드에 실패했습니다.", error: error.message },
        { status: 500 }
      );
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from("vote-options").getPublicUrl(filePath);

    return NextResponse.json(
      {
        url: publicUrl,
        path: filePath,
        message: "파일이 성공적으로 업로드되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

