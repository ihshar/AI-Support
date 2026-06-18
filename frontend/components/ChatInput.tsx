import React from "react";
import { ChatInputProps } from "@/types/chat";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

function ChatInput({
  newChat,
  handleSend,
  input,
  setInput,
  handleClear,
}: ChatInputProps) {
  return (
    <div className="mt-4 flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type your message..."
        // className="flex-1 border rounded-lg px-3 py-2"
      />

      <Button
        size="lg"
        onClick={handleSend}
        // className="bg-black text-white px-4 py-2 rounded-lg"
      >
        Send
      </Button>
      {/* <button
          onClick={handleClear}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Clear
        </button> */}
      {/* <button
          onClick={newChat}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + New Chat
        </button> */}
    </div>
  );
}

export default ChatInput;
