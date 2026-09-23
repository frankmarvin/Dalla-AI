import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { loadMessages } from "@/lib/chat-data";
import { ChatView } from "@/components/dallaAI/ChatView";

export const Route =
  createFileRoute(
    "/app/chat/$threadId",
  )({
    component: ChatRoute,
  });

function ChatRoute() {
  const { threadId } =
    Route.useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "messages",
      threadId,
    ],

    queryFn: () =>
      loadMessages(threadId),

    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold">
            Could not load this conversation
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Please refresh and try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatView
      key={threadId}
      threadId={threadId}
      initialMessages={
        data ?? []
      }
    />
  );
}
