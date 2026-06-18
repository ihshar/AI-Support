import { ChatPropMessage } from "@/types/chat";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatMessages({ messages, loading }: ChatPropMessage) {
  return (
    <div className="flex-1 rounded-lg p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <p className="text-muted-foreground">Start a conversation...</p>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div className="inline-block max-w-3xl rounded-lg bg-secondary px-4 py-2">
                {
                  <Markdown
                    components={{
                      code(props) {
                        const { children, className } = props;

                        const match = /language-(\w+)/.exec(className || "");

                        return match ? (
                          <div className="relative">
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  String(children).replace(/\n$/, ""),
                                )
                              }
                              className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-zinc-700text-white"
                            >
                              Copy
                            </button>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                borderRadius: "12px",
                                overflowX: "auto",
                              }}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={className}>{children}</code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </Markdown>
                }
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <div className="inline-block rounded-lg bg-secondary px-4 py-2">
                AI is typing...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChatMessages;
