import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sparkle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

type Search = { mode?: "signin" | "signup" | "reset" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    mode:
      search["mode"] === "signup" || search["mode"] === "reset"
        ? (search["mode"] as "signup" | "reset")
        : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Dalla AI" },
      { name: "description", content: "Sign in or create your Dalla AI account." },
      { property: "og:title", content: "Sign in · Dalla AI" },
      { property: "og:description", content: "Sign in or create your Dalla AI account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/app" });
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Check your inbox for a reset link.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) toast.success("Almost there — confirm your email to finish signing up.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in didn't work. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app" });
  }

  const title = mode === "signup" ? "Create your account" : mode === "reset" ? "Reset password" : "Welcome back";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-14">
      <div className="w-full max-w-md rounded-4xl border border-border/60 bg-card p-8 shadow-soft">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-aurora shadow-glow">
            <Sparkle className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold">Dalla AI</span>
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "reset"
            ? "We'll email you a link to set a new password."
            : "Think Faster. Create Smarter."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}
          <Button type="submit" className="w-full shadow-glow" disabled={busy}>
            {mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
          </Button>
        </form>

        {mode !== "reset" && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              Continue with Google
            </Button>
          </>
        )}

        <div className="mt-8 space-y-2 text-center text-sm text-muted-foreground">
          {mode === "signin" && (
            <>
              <p>
                New here?{" "}
                <Link to="/auth" search={{ mode: "signup" }} className="text-primary hover:underline">
                  Create an account
                </Link>
              </p>
              <p>
                <Link to="/auth" search={{ mode: "reset" }} className="hover:underline">
                  Forgot your password?
                </Link>
              </p>
            </>
          )}
          {mode !== "signin" && (
            <p>
              <Link to="/auth" search={{ mode: "signin" }} className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
