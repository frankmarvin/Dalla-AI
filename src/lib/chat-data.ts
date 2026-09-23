import type { UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";

export type Thread = {
  id: string;
  title: string;
  pinned: boolean;
  archived: boolean;
  project_id: string | null;
  updated_at: string;
};

export async function listThreads(): Promise<Thread[]> {
  const { data, error } = await supabase
    .from("threads")
    .select("id,title,pinned,archived,project_id,updated_at")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Thread[];
}

export async function createThread(title = "New chat", projectId?: string | null) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("threads")
    .insert({ user_id: uid, title, project_id: projectId ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function renameThread(id: string, title: string) {
  const { error } = await supabase.from("threads").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function setThreadFlag(id: string, patch: Partial<Pick<Thread, "pinned" | "archived">>) {
  const { error } = await supabase.from("threads").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteThread(id: string) {
  const { error } = await supabase.from("threads").delete().eq("id", id);
  if (error) throw error;
}

export async function loadMessages(threadId: string): Promise<UIMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id,role,parts")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as UIMessage["role"],
    parts: (row.parts ?? []) as UIMessage["parts"],
  }));
}

function toText(message: UIMessage) {
  return message.parts
    .map((part) => ("text" in part && typeof part.text === "string" ? part.text : ""))
    .join("");
}

export async function saveMessage(threadId: string, message: UIMessage) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return;
  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    user_id: uid,
    client_id: message.id,
    role: message.role,
    parts: message.parts as never,
    text_content: toText(message),
  });
  if (error) console.error("Could not save message", error);
  await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
}

export async function maybeTitleThread(threadId: string, firstUserText: string) {
  const title = firstUserText.trim().slice(0, 60) || "New chat";
  const { data } = await supabase.from("threads").select("title").eq("id", threadId).single();
  if (data?.title && data.title !== "New chat") return;
  await renameThread(threadId, title);
}
