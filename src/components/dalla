import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  LogOut,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Search,
  Sparkle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createThread,
  deleteThread,
  listThreads,
  renameThread,
  setThreadFlag,
  type Thread,
} from "@/lib/chat-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const params = useParams({ strict: false }) as { threadId?: string };
  const [query, setQuery] = useState("");

  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: listThreads });

  const newChat = useMutation({
    mutationFn: () => createThread(),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      onNavigate?.();
      navigate({ to: "/app/chat/$threadId", params: { threadId: id } });
    },
    onError: () => toast.error("Could not start a new chat"),
  });

  const visible = threads.filter(
    (thread) =>
      !thread.archived && thread.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function mutateThread(fn: () => Promise<unknown>) {
    try {
      await fn();
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    } catch {
      toast.error("That didn't work. Please try again.");
    }
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="flex size-8 items-center justify-center rounded-xl bg-aurora shadow-glow">
          <Sparkle className="size-4 text-primary-foreground" />
        </span>
        <span className="font-display text-base font-bold">Dalla AI</span>
      </div>

      <div className="px-3">
        <Button
          className="w-full justify-start shadow-glow"
          onClick={() => newChat.mutate()}
          disabled={newChat.isPending}
        >
          <Plus className="size-4" /> New chat
        </Button>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats"
            className="pl-9"
            aria-label="Search chats"
          />
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {visible.length === 0 && (
          <p className="px-3 py-6 text-sm text-muted-foreground">No chats yet.</p>
        )}
        {visible.map((thread: Thread) => {
          const active = params.threadId === thread.id;
          return (
            <div
              key={thread.id}
              className={cn(
                "group flex items-center gap-1 rounded-xl px-2 transition-colors",
                active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
              )}
            >
              <Link
                to="/app/chat/$threadId"
                params={{ threadId: thread.id }}
                onClick={onNavigate}
                className="flex-1 truncate py-2.5 text-sm text-sidebar-foreground"
              >
                {thread.pinned && <Pin className="mr-1.5 inline size-3 text-primary" />}
                {thread.title}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" aria-label="Chat options">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      const title = window.prompt("Rename chat", thread.title);
                      if (title) mutateThread(() => renameThread(thread.id, title));
                    }}
                  >
                    <Pencil className="size-4" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => mutateThread(() => setThreadFlag(thread.id, { pinned: !thread.pinned }))}
                  >
                    <Pin className="size-4" /> {thread.pinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => mutateThread(() => setThreadFlag(thread.id, { archived: true }))}
                  >
                    <Archive className="size-4" /> Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async () => {
                      await mutateThread(() => deleteThread(thread.id));
                      if (active) navigate({ to: "/app" });
                    }}
                  >
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-muted-foreground">{user?.email}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
