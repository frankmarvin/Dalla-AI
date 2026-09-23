import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Braces, Copy, PenLine, RefreshCw, CornerDownRight, Globe, MessagesSquare, Sparkle } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { maybeTitleThread, saveMessage } from "@/lib/chat-data";

const MODES = [
  { id: "chat", label: "Chat", icon: MessagesSquare },
  { id: "code", label: "Code", icon: Braces },
  { id: "write", label: "Write", icon: PenLine },
  { id: "research", label: "Research", icon: Globe },
] as const;

type Mode = (typeof MODES)[number]["id"];

function messageText(message: UIMessage) {
  return message.parts
    .map((part) => ("text" in part && typeof part.text === "string" ? part.text : ""))
    .join("");
}

export function ChatView({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("chat");
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const modeRef = useRef<Mode>(mode);
  modeRef.current = mode;

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: msgs, id }) => ({
        body: { messages: msgs, id, mode: modeRef.current },
      }),
    }),
    onFinish: ({ message }) => {
      void saveMessage(threadId, message as UIMessage).then(() =>
        queryClient.invalidateQueries({ queryKey: ["threads"] }),
      );
    },
    onError: (err) => {
      toast.error(err.message || "Dalla couldn't answer that request.");
    },
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

async function submit(text: string) {
  const value = text.trim();

  if (!value || busy) {
    return;
  }

  setInput("");

  const userMessage: UIMessage = {
    id: crypto.randomUUID(),
    role: "user",
    parts: [
      {
        type: "text",
        text: value,
      },
    ],
  };

  try {
    await saveMessage(threadId, userMessage);

    await maybeTitleThread(threadId, value);

    queryClient.invalidateQueries({
      queryKey: ["threads"],
    });

    await sendMessage({
      text: value,
    });
  } catch (error) {
    console.error("Failed to send message:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Dalla couldn't send your message.",
    );
  }
} 

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              mode === item.id
                ? "border-transparent bg-aurora text-primary-foreground shadow-glow"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="size-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="flex size-14 items-center justify-center rounded-3xl bg-aurora shadow-glow">
                <Sparkle className="size-6 text-primary-foreground" />
              </span>
              <h2 className="mt-6 text-2xl font-bold">What are we making today?</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Ask a question, paste some code, or start a piece of research.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent
                className={cn(
                  message.role === "assistant" && "bg-transparent p-0 text-foreground",
                )}
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  ) : null,
                )}
                {message.role === "assistant" && status !== "streaming" && (
                  <div className="mt-3 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Copy message"
                      onClick={() => {
                        void navigator.clipboard.writeText(messageText(message));
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Regenerate response"
                      onClick={() => regenerate()}
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Continue generating"
                      onClick={() => submit("Continue from where you stopped.")}
                    >
                      <CornerDownRight className="size-4" />
                    </Button>
                  </div>
                )}
                {message.role === "user" && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit prompt"
                      onClick={() => {
                        setInput(messageText(message));
                        textareaRef.current?.focus();
                      }}
                    >
                      <PenLine className="size-4" />
                    </Button>
                  </div>
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" && <Shimmer className="px-1 py-2 text-sm">Thinking…</Shimmer>}
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error.message}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-3xl px-4 pb-5">
        <PromptInput
          onSubmit={(message, event) => {
            event.preventDefault();
            void submit(message.text || input);
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Dalla anything…"
          />
          <PromptInputFooter className="justify-between">
            <PromptInputTools>
              <span className="px-1 text-xs text-muted-foreground">
                {MODES.find((item) => item.id === mode)?.label} mode
              </span>
            </PromptInputTools>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
