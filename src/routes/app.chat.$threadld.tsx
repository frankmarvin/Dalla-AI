import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { loadMessages } from "@/lib/chat-data";
import { ChatView } from "@/components/dalla/ChatView";

export const Route = createFileRoute("/app/chat/$threadId")({
  component: ChatRoute,
});

function ChatRoute() {
  const { threadId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => loadMessages(threadId),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  return <ChatView key={threadId} threadId={threadId} initialMessages={data ?? []} />;
}
