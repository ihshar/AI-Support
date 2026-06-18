"use client";

import { useEffect, useState, useRef } from "react";
import { Message } from "@/types/chat";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { Conversation } from "@/types/chat";
import ConversationList from "@/components/ConversationList";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

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
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    const loadConversation = async () => {
      const response = await fetch("/api/conversations");
      const saved = await response.json();

      const conversationsWithMessages = saved.map((chat: any) => ({
        ...chat,
        message: [],
      }));
      if (conversationsWithMessages.length === 0) {
        newChat();
      } else {
        setConversations(conversationsWithMessages);
        setCurrentConversationId(conversationsWithMessages[0].id);
      }
    };
    loadConversation();
  }, []);

  useEffect(() => {
    messageEndRef?.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeConversations?.messages]);

  return (
    <main className="h-screen flex overflow-hidden bg-background">
      <aside className="w-72 border-r  text-black">
        <div className="p-4">
          <h1 className="text-xl font-semibold">AI Assistant</h1>
          <Button
            variant={"outline"}
            className="w-full rounded-xlbg-white text-black py-3 font-medium"
            onClick={newChat}
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
        />
      </aside>
      {/* <div>Current Conversation ID:{currentConversationId}</div> */}
      {/* <div>ActiveConversation: {activeConversations?.title}</div> */}
      <section className="flex-1 flex flex-col">
        <div className="flex justify-end p-4">
          <Button
            variant={"secondary"}
            onClick={handleClear}
            className="border rounded-lg px-3 py-2"
          >
            Clear Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {(activeConversations?.messages?.length ?? 0) === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-4">🤖 AI Assistant</h1>

                <p className="text-muted-foreground">
                  Ask anything. Start a conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto p-6">
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
          />
        </div>
      </section>
    </main>
  );
}
