"use client";
import { useEffect, useState, useRef } from "react";
import { Message } from "@/types/chat";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { Conversation } from "@/types/chat";
import ConversationList from "@/components/ConversationList"; 
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Page() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, isLoaded } = useUser();
  const previousAuthState = useRef(isSignedIn);

  const handleClear = async () => {
    await fetch(`/api/message?conversationId=${currentConversationId}`, {
      method: "DELETE",
    });
    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === currentConversationId ? { ...chat, messages: [] } : chat,
      ),
    );
  };

  const newChat = async () => {
    const conversations = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };

    const response = await fetch("/api/conversations", { method: "POST" });
    const conversation = await response.json();
    setConversations((prev) => [...prev, conversation]);
    setCurrentConversationId(conversation.id);
  };

  const activeConversations = conversations.find(
    (chat) => chat.id === currentConversationId,
  );

  const handleSend = async () => {
    try {
      const prompt = input;

      if (!prompt.trim()) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString(),
      };

      const messageToSend = [
        ...(activeConversations?.messages ?? []),
        userMessage,
      ];

      await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: prompt,
          role: "user",
          conversationId: currentConversationId,
        }),
      });
      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === currentConversationId
            ? {
                ...chat,
                title:
                  (chat.messages ?? []).length === 0
                    ? prompt.trim().slice(0, 30)
                    : chat.title,
                messages: [...(chat.messages ?? []), userMessage],
              }
            : chat,
        ),
      );
      setInput("");

      setLoading(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messageToSend,
        }),
      });

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      const assistantID = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantID,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === currentConversationId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat,
        ),
      );

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);

        fullText += chunk;

        setConversations((prev) =>
          prev.map((chat) =>
            chat.id === currentConversationId
              ? {
                  ...chat,
                  messages: chat.messages.map((message) =>
                    message.id === assistantID
                      ? {
                          ...message,
                          content: fullText,
                        }
                      : message,
                  ),
                }
              : chat,
          ),
        );
      }

      await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: fullText,
          role: "assistant",
          conversationId: currentConversationId,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (previousAuthState.current !== isSignedIn) {
      if (!isSignedIn) {
        setConversations([]);
        setCurrentConversationId("");
        setInput("");
      }
      loadConversation();
    }

    previousAuthState.current = isSignedIn;
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  const loadConversation = async () => {
    const response = await fetch("/api/conversations");
    const saved = await response.json();

    const conversationsWithMessages = saved.map((chat: any) => ({
      ...chat,
      message: chat.messages || [],
    }));
    if (conversationsWithMessages.length === 0) {
      if (!isSignedIn) {
        return;
      }
      newChat();
    } else {
      setConversations(conversationsWithMessages);
      setCurrentConversationId(conversationsWithMessages[0].id);
    }
  };
  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    messageEndRef?.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeConversations?.messages]);

  return (
    <main className="h-dvh flex overflow-hidden">
      <aside className="hidden md:block w-80 border-r bg-muted/20">
        <div className="p-4">
          <h1 className="text-xl font-semibold">AI Assistant</h1>
          <Button
            variant={"outline"}
            className="w-full rounded-xlbg-white text-black py-3 font-medium"
            onClick={newChat}
            disabled={!isSignedIn}
          >
            + New Chat
          </Button>
        </div>
        <ConversationList
          newChat={newChat}
          setConversations={setConversations}
          currentConversationId={currentConversationId}
          conversations={conversations}
          setCurrentConversationId={setCurrentConversationId}
          isSignedIn={isSignedIn}
        />
      </aside>
      {/* <div>Current Conversation ID:{currentConversationId}</div> */}
      {/* <div>ActiveConversation: {activeConversations?.title}</div> */}
      {/* <div className="md:hidden border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold">AI Assistant</h1>

        <Button variant="outline" size="sm">
          Chats
        </Button>
      </div> */}

      <div className="md:hidden fixed top-0 left-0 right-0 border-b bg-background px-4 py-3 flex items-center z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Conversations</SheetTitle>
            <div className="p-4 border-b">
              <h1 className="text-xl font-semibold">AI Assistant</h1>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={newChat}
                disabled={!isSignedIn}
              >
                + New Chat
              </Button>
            </div>

            <ConversationList
              newChat={newChat}
              setConversations={setConversations}
              currentConversationId={currentConversationId}
              conversations={conversations}
              setCurrentConversationId={setCurrentConversationId}
              isSignedIn={isSignedIn}
            />
          </SheetContent>
        </Sheet>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold">
          AI Assistant
        </h1>
      </div>
      <section className="flex-1 flex flex-col pt-14 md:pt-0">
        <div className="border-b px-6 py-3 flex items-center justify-between">
          <h2 className="font-medium truncate">
            {activeConversations?.title || "New Chat"}
          </h2>

          <Button
            variant={"secondary"}
            onClick={handleClear}
            className="border rounded-lg px-3 py-2"
            disabled={!isSignedIn}
          >
            Clear Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(activeConversations?.messages?.length ?? 0) === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl md:text-5xl font-semibold">
                  AI Assistant
                </h1>

                <p className="text-muted-foreground">
                  Ask anything. Start a conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 md:px-6">
                <ChatMessages
                  loading={loading}
                  messages={activeConversations?.messages ?? []}
                />
                <div ref={messageEndRef}></div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t p-4 bg-background">
          <ChatInput
            newChat={newChat}
            handleClear={handleClear}
            setInput={setInput}
            input={input}
            handleSend={handleSend}
            isSignedIn={isSignedIn}
          />
        </div>
      </section>
    </main>
  );
}
