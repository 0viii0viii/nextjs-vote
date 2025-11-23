"use client";
import { useEffect, useMemo, useState } from "react";

import { useVoteComments } from "@/features/comments/model/use-vote-comments.ts";
import { cn } from "@/shared/lib/utils.ts";
import { Button } from "@/shared/ui/button.tsx";
import { Label } from "@/shared/ui/label.tsx";
import { Skeleton } from "@/shared/ui/skeleton.tsx";
import { Textarea } from "@/shared/ui/textarea.tsx";
import { MessageCircle } from "lucide-react";

type VoteCommentsProps = {
  voteId: string;
  commentsCount: number;
  onCommentAdded: () => void;
};

export function VoteComments({
  voteId,
  commentsCount,
  onCommentAdded,
}: VoteCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const {
    comments,
    hasLoaded,
    isLoading,
    isSubmitting,
    error,
    loadComments,
    addComment,
  } = useVoteComments(voteId);

  useEffect(() => {
    if (isOpen && !hasLoaded) {
      void loadComments();
    }
  }, [hasLoaded, isOpen, loadComments]);

  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [comments]
  );

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    try {
      await addComment(content.trim());
      setContent("");
      onCommentAdded();
    } catch {
      // 에러 메시지는 훅에서 처리됨
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2 px-0 text-muted-foreground hover:text-foreground",
          isOpen && "text-foreground"
        )}
        onClick={handleToggle}
      >
        <MessageCircle className="size-4" />
        댓글 {commentsCount}
        <span className="text-xs text-muted-foreground">
          {isOpen ? "닫기" : "열기"}
        </span>
      </Button>

      {isOpen ? (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`comment-input-${voteId}`}>댓글 작성</Label>
              <Textarea
                id={`comment-input-${voteId}`}
                rows={3}
                value={content}
                maxLength={500}
                onChange={(event) => setContent(event.target.value)}
                placeholder="투표에 대한 의견을 남겨보세요."
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                size="sm"
              >
                {isSubmitting ? "등록 중..." : "댓글 남기기"}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))
            ) : sortedComments.length > 0 ? (
              sortedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border bg-background p-3"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">
                      {comment.userId.slice(0, 6)} ···
                    </span>
                    <time>{new Date(comment.createdAt).toLocaleString()}</time>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                첫 댓글을 남겨보세요.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
