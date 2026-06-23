"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isSignedIn } = useUser();
  const router = useRouter()
  useEffect(()=>{
    if(isSignedIn){
      router.push('/chat')
    }
  },[])

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">

        <p className="mb-6 text-sm text-neutral-500">
          Built for focused work
        </p>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          AI Assistant
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-400 sm:text-lg">
          Your personal workspace for conversations,
          ideas, and problem solving.
        </p>

        <SignInButton mode="modal" forceRedirectUrl="/chat">
          <Button
            className="mt-10 h-11 rounded-lg bg-white px-6 text-black hover:bg-neutral-200"
          >
            Get Started
          </Button>
        </SignInButton>

      </div>
    </main>
  );
}