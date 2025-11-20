"use client";

import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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

type VoteOption = {
  id: string;
  name: string;
  description: string;
  imageFile?: File;
};

const OPTION_COUNT = 2;
export function WritePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(
    CATEGORY_GROUPS[0]?.children[0]?.id ?? ""
  );
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [options, setOptions] = useState<VoteOption[]>(() =>
    Array.from({ length: OPTION_COUNT }).map((_, index) => ({
      id: `option-${index + 1}`,
      name: `옵션 ${index + 1}`,
      description: "",
    }))
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      title,
      content,
      categoryId,
      options,
    });
  };

  const handleOptionNameChange = (id: string, value: string) => {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === id ? { ...option, name: value } : option
      )
    );
  };

  const handleOptionDescriptionChange = (id: string, value: string) => {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === id ? { ...option, description: value } : option
      )
    );
  };

  const handleOptionImageChange = (id: string, file?: File) => {
    setOptions((prev) =>
      prev.map((option) =>
        option.id === id ? { ...option, imageFile: file } : option
      )
    );
  };

  const isSubmitDisabled = useMemo(() => {
    const hasEmptyOption = options.some(
      (option) => !option.name.trim() || !option.description.trim()
    );
    return !title.trim() || !content.trim() || !categoryId || hasEmptyOption;
  }, [title, content, options, categoryId]);

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
        onSubmit={handleSubmit}
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
              <Input
                id="vote-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
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
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={8}
                maxLength={500}
                className="resize-none"
                required
              />
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
                        setCategoryId(value);
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
            {options.map((option, index) => (
              <div
                key={option.id}
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
                    <Label htmlFor={`${option.id}-name`}>제목</Label>
                    <Input
                      id={`${option.id}-name`}
                      value={option.name}
                      onChange={(event) =>
                        handleOptionNameChange(option.id, event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${option.id}-description`}>내용</Label>
                    <Textarea
                      id={`${option.id}-description`}
                      value={option.description}
                      onChange={(event) =>
                        handleOptionDescriptionChange(
                          option.id,
                          event.target.value
                        )
                      }
                      rows={6}
                      required
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${option.id}-image`}>
                      사진 첨부 (선택)
                    </Label>
                    <Input
                      id={`${option.id}-image`}
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleOptionImageChange(
                          option.id,
                          event.target.files?.[0]
                        )
                      }
                      className="cursor-pointer"
                    />
                    {option.imageFile ? (
                      <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <ImagePlus className="size-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">
                              {option.imageFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(option.imageFile.size / 1024)}KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOptionImageChange(option.id)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">이미지 삭제</span>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF 이미지를 업로드할 수 있습니다. 최대 5MB.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <div className="flex flex-row items-center justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/">취소</Link>
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              투표 생성하기
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
