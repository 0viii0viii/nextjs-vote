"use client";

import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createVote } from "@/features/write-post/api/create-vote.ts";
import {
  OPTION_COUNT,
  writePostSchema,
  type WritePostFormValues,
} from "@/features/write-post/model/schema.ts";
import { CATEGORY_GROUPS } from "@/shared/constants/category.ts";
import { Button } from "@/shared/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card.tsx";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/drawer.tsx";
import { Input } from "@/shared/ui/input.tsx";
import { Label } from "@/shared/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group.tsx";
import { Separator } from "@/shared/ui/separator.tsx";
import { Textarea } from "@/shared/ui/textarea.tsx";

export function WritePost() {
  const defaultCategoryId = CATEGORY_GROUPS[0]?.children[0]?.id ?? "";
  const defaultOptions = Array.from({ length: OPTION_COUNT }).map(
    (_, index) => ({
      name: `옵션 ${index + 1}`,
      description: "",
      imageUrl: "",
    })
  );

  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [optionFiles, setOptionFiles] = useState<Record<string, File | null>>(
    {}
  );
  const form = useForm<WritePostFormValues>({
    resolver: zodResolver(writePostSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      categoryId: defaultCategoryId,
      options: defaultOptions,
    },
  });

  const { control, formState, handleSubmit, register, reset, setValue } = form;

  const { fields } = useFieldArray({
    control,
    name: "options",
  });

  const categoryId = useWatch({
    control,
    name: "categoryId",
  });
  const selectedCategory = (() => {
    for (const group of CATEGORY_GROUPS) {
      const category = group.children.find((child) => child.id === categoryId);
      if (category) {
        return {
          groupLabel: group.label,
          ...category,
        };
      }
    }
    return undefined;
  })();

  const handleOptionImageChange = (id: string, file?: File) => {
    setOptionFiles((prev) => ({
      ...prev,
      [id]: file ?? null,
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message ?? "이미지 업로드에 실패했습니다.");
    }

    return result.url;
  };

  const onSubmit = async (values: WritePostFormValues) => {
    try {
      // 이미지 업로드 처리
      const optionsWithImages = await Promise.all(
        values.options.map(async (option, index) => {
          const fieldId = fields[index]?.id;
          const file = fieldId ? optionFiles[fieldId] : null;

          if (file) {
            try {
              const imageUrl = await uploadImage(file);
              return { ...option, imageUrl };
            } catch (error) {
              if (error instanceof Error) {
                toast.error(
                  `옵션 ${index + 1} 이미지 업로드 실패: ${error.message}`
                );
              }
              throw error;
            }
          }

          return { ...option, imageUrl: "" };
        })
      );

      await createVote({ ...values, options: optionsWithImages });
      toast.success("투표가 성공적으로 생성되었습니다.");
      reset({
        title: "",
        content: "",
        categoryId: defaultCategoryId,
        options: defaultOptions,
      });
      setOptionFiles({});
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <section className="space-y-8">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">새 투표 생성</p>
          <h1 className="text-3xl font-bold">투표 작성</h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[360px,1fr]"
      >
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>투표의 제목과 설명을 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="vote-title">투표 제목</Label>
              <Input id="vote-title" {...register("title")} />
              {formState.errors.title ? (
                <p className="text-xs text-destructive">
                  {formState.errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="vote-description">투표 내용</Label>
                <span className="text-xs text-muted-foreground">
                  최대 500자
                </span>
              </div>
              <Textarea
                id="vote-description"
                rows={8}
                maxLength={500}
                className="resize-none"
                {...register("content")}
              />
              {formState.errors.content ? (
                <p className="text-xs text-destructive">
                  {formState.errors.content.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>카테고리</Label>
              <Drawer
                direction="right"
                open={isCategoryDrawerOpen}
                onOpenChange={setIsCategoryDrawerOpen}
              >
                <DrawerTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center text-left">
                      <span className="text-sm font-semibold">
                        {selectedCategory?.label ?? "카테고리를 선택하세요"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">변경</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>카테고리 선택</DrawerTitle>
                    <DrawerDescription>
                      투표 성격에 맞는 카테고리를 고르면 참여자가 더 쉽게 찾을
                      수 있어요.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="space-y-6 p-4">
                    <RadioGroup
                      value={categoryId}
                      onValueChange={(value) => {
                        setValue("categoryId", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setIsCategoryDrawerOpen(false);
                      }}
                      className="gap-4"
                    >
                      {CATEGORY_GROUPS.map((group) => (
                        <div key={group.id} className="space-y-3">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            {group.label}
                          </p>
                          <div className="space-y-2">
                            {group.children.map((child) => (
                              <label
                                key={child.id}
                                htmlFor={child.id}
                                className="flex items-start gap-3 rounded-xl border p-3 transition hover:border-primary"
                              >
                                <RadioGroupItem
                                  id={child.id}
                                  value={child.id}
                                  className="mt-1"
                                />
                                <div className="space-y-1">
                                  <p className="font-medium">{child.label}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </DrawerContent>
              </Drawer>
              {formState.errors.categoryId ? (
                <p className="text-xs text-destructive">
                  {formState.errors.categoryId.message}
                </p>
              ) : null}
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <p className="font-medium">투표 규칙</p>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                <li>옵션은 항상 2개로 고정됩니다.</li>
                <li>사진은 선택 사항이며 PNG, JPG 형식을 권장합니다.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>투표 옵션</CardTitle>
            <CardDescription>
              참여자가 선택할 두 가지 옵션을 완성하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => {
              const optionFile = optionFiles[field.id];

              return (
                <div
                  key={field.id}
                  className="rounded-xl border border-dashed p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        옵션 {index + 1}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      필수 입력
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`${field.id}-name`}>제목</Label>
                      <Input
                        id={`${field.id}-name`}
                        {...register(`options.${index}.name`)}
                      />
                      {formState.errors.options?.[index]?.name?.message ? (
                        <p className="text-xs text-destructive">
                          {formState.errors.options[index]?.name?.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${field.id}-image`}>
                        사진 첨부 (선택)
                      </Label>
                      <Input
                        id={`${field.id}-image`}
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleOptionImageChange(
                            field.id,
                            event.target.files?.[0]
                          )
                        }
                        className="cursor-pointer"
                      />
                      {optionFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <ImagePlus className="size-4 text-muted-foreground" />
                              <div>
                                <p className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                                  {optionFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(optionFile.size / 1024)}KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOptionImageChange(field.id)}
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">이미지 삭제</span>
                            </Button>
                          </div>
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                            <Image
                              src={URL.createObjectURL(optionFile)}
                              alt={`옵션 ${index + 1} 미리보기`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, JPEG, GIF, WebP 이미지만 업로드할 수 있으며
                          최대 5MB까지 허용됩니다.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${field.id}-description`}>내용</Label>
                      <Textarea
                        id={`${field.id}-description`}
                        rows={6}
                        className="resize-none"
                        {...register(`options.${index}.description`)}
                      />
                      {formState.errors.options?.[index]?.description
                        ?.message ? (
                        <p className="text-xs text-destructive">
                          {
                            formState.errors.options[index]?.description
                              ?.message
                          }
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="flex flex-row items-center justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/">취소</Link>
            </Button>
            <Button
              type="submit"
              disabled={!formState.isValid || formState.isSubmitting}
            >
              {formState.isSubmitting ? "생성 중..." : "투표 생성하기"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
