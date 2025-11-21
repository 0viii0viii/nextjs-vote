import { z } from "zod";

export const OPTION_COUNT = 2;

export const voteOptionSchema = z.object({
  name: z
    .string()
    .min(1, "옵션 제목을 입력하세요.")
    .max(50, "옵션 제목은 50자 이하로 입력하세요."),
  description: z
    .string()
    .min(1, "옵션 설명을 입력하세요.")
    .max(500, "옵션 설명은 500자 이하로 입력하세요."),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const writePostSchema = z.object({
  title: z
    .string()
    .min(1, "투표 제목을 입력하세요.")
    .max(100, "투표 제목은 100자 이하로 입력하세요."),
  content: z
    .string()
    .min(1, "투표 내용을 입력하세요.")
    .max(500, "투표 내용은 500자 이하로 입력하세요."),
  categoryId: z.string().min(1, "카테고리를 선택하세요."),
  options: z
    .array(voteOptionSchema)
    .length(OPTION_COUNT, "옵션은 2개여야 합니다."),
});

export type WritePostFormValues = z.infer<typeof writePostSchema>;
