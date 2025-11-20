"use client";

import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Pencil } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            V
          </div>
          <span className="hidden font-bold text-xl sm:inline-block">Vote</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">회원가입</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9" asChild>
                  <Link href="/write">
                    <Pencil className="size-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>글 작성</p>
              </TooltipContent>
            </Tooltip>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
