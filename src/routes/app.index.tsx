import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { createThread, listThreads } from "@/lib/chat-data";

export const Route = createFileRoute("/app/")({
  component: WorkspaceIndex,
});

function WorkspaceIndex() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const threads = await listThreads();
      const existing = threads.find((thread) => !thread.archived);
      const id = existing ? existing.id : await createThread();
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/app/chat/$threadId", params: { threadId: id }, replace: true });
    })();
  }, [navigate, queryClient]);

  return (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      Opening your workspace…
    </div>
  );
}
