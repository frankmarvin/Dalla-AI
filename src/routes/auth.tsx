import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "signin" | "signup" | "reset";

type AuthSearch = {
  mode?: AuthMode;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const mode = search.mode;

    if (
      mode === "signin" ||
      mode === "signup" ||
      mode === "reset"
    ) {
      return {
        mode,
      };
    }

    return {
      mode: "signin",
    };
  },

  head: () => ({
    meta: [
      {
        title: "Sign in · Dalla AI",
      },
      {
        name: "description",
        content:
          "Sign in or create your Dalla AI account to access your AI workspace.",
      },
      {
        name: "robots",
        content: "noindex,nofollow",
      },
    ],
  }),

  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  const search = useSearch({
    from: "/auth",
  });

  const mode: AuthMode = search.mode ?? "signin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted && session) {
          await navigate({
            to: "/app",
          });
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void checkExistingSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) {
          return;
        }

        if (session) {
          await navigate({
            to: "/app",
          });
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  function changeMode(nextMode: AuthMode) {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    void navigate({
      to: "/auth",
      search: {
        mode: nextMode,
      },
    });
  }

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSignIn(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setBusy(true);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (error) {
        throw error;
      }

      toast.success("Welcome back to Dalla AI.");

      await navigate({
        to: "/app",
      });
    } catch (error) {
      console.error("Sign in failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (!normalizedName) {
      toast.error("Please enter your name.");
      return;
    }

    if (!normalizedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Your password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Your passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const redirectUrl = `${window.location.origin}/app`;

      const { data, error } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: normalizedName,
              name: normalizedName,
            },
          },
        });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success(
          "Your Dalla AI account has been created.",
        );

        await navigate({
          to: "/app",
        });

        return;
      }

      toast.success(
        "Account created. Check your email to confirm your account.",
      );

      setPassword("");
      setConfirmPassword("");

      await navigate({
        to: "/auth",
        search: {
          mode: "signin",
        },
      });
    } catch (error) {
      console.error("Sign up failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Enter your email address first.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setBusy(true);

    try {
      const redirectUrl =
        `${window.location.origin}/auth?mode=signin`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo: redirectUrl,
          },
        );

      if (error) {
        throw error;
      }

      toast.success(
        "If an account exists for that email, a password reset link has been sent.",
      );

      setPassword("");
    } catch (error) {
      console.error(
        "Password reset failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);

    try {
      const redirectTo =
        `${window.location.origin}/app`;

      const { data, error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

      if (error) {
        throw error;
      }

      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (error) {
      console.error(
        "Google sign in failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google.",
      );

      setBusy(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Checking your session…
        </div>
      </main>
    );
  }

  if (mode === "reset") {
    return (
      <main className="min-h-screen bg-background">
        <div className="grid min-h-screen lg:grid-cols-2">
          <AuthBrandPanel />

          <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
            <div className="w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <DallaLogo />
              </div>

              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  Reset your password
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email and we'll send you a
                  secure password reset link.
                </p>
              </div>

              <form
                onSubmit={handlePasswordReset}
                className="space-y-5"
              >
                <EmailField
                  email={email}
                  setEmail={setEmail}
                  disabled={busy}
                />

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending reset link…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => changeMode("signin")}
                className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Back to sign in
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthBrandPanel />

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <DallaLogo />
            </div>

            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {isSignup
                  ? "Create your Dalla AI account"
                  : "Welcome back"}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {isSignup
                  ? "Create your account and start using Dalla AI."
                  : "Sign in to continue to your Dalla AI workspace."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() =>
                  changeMode("signin")
                }
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  !isSignup
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() =>
                  changeMode("signup")
                }
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isSignup
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create account
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={handleGoogle}
              disabled={busy}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />

              <span className="text-xs text-muted-foreground">
                OR
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>

            {isSignup ? (
              <form
                onSubmit={handleSignUp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="full-name">
                    Full name
                  </Label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="full-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Frank Marvin"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      className="pl-10"
                      disabled={busy}
                      required
                    />
                  </div>
                </div>

                <EmailField
                  email={email}
                  setEmail={setEmail}
                  disabled={busy}
                />

                <PasswordField
                  id="signup-password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  visible={showPassword}
                  onToggle={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  disabled={busy}
                  autoComplete="new-password"
                />

                <PasswordField
                  id="confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword(
                      (value) => !value,
                    )
                  }
                  disabled={busy}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handleSignIn}
                className="space-y-5"
              >
                <EmailField
                  email={email}
                  setEmail={setEmail}
                  disabled={busy}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">
                      Password
                    </Label>

                    <button
                      type="button"
                      onClick={() =>
                        changeMode("reset")
                      }
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <PasswordField
                    id="signin-password"
                    label=""
                    value={password}
                    onChange={setPassword}
                    visible={showPassword}
                    onToggle={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    disabled={busy}
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            )}

            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
              By continuing, you agree to Dalla AI's{" "}
              <Link
                to="/"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function EmailField({
  email,
  setEmail,
  disabled,
}: {
  email: string;
  setEmail: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">
        Email address
      </Label>

      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="pl-10"
          disabled={disabled}
          required
        />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled: boolean;
  autoComplete: string;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
        </Label>
      )}

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="pl-10 pr-10"
          disabled={disabled}
          required
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function DallaLogo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2"
      aria-label="Dalla AI home"
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <span className="font-display text-sm font-bold">
          D
        </span>
      </div>

      <span className="font-display text-lg font-bold tracking-tight">
        Dalla AI
      </span>
    </Link>
  );
}

function AuthBrandPanel() {
  return (
    <section className="relative hidden overflow-hidden bg-muted/30 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
      <div className="relative z-10">
        <DallaLogo />
      </div>

      <div className="relative z-10 max-w-xl">
        <div className="mb-5 inline-flex rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          AI workspace
        </div>

        <h2 className="font-display text-4xl font-bold tracking-tight xl:text-5xl">
          Think faster.
          <br />
          Create smarter.
        </h2>

        <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          Chat, research, analyze documents, work
          with images and build ideas in one
          intelligent Dalla AI workspace.
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} Dalla AI
        </span>

        <span>
          Secure authentication
        </span>
      </div>

      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-primary/10 blur-3xl" />
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4Z"
      />

      <path
        fill="#34A853"
        d="M12 21.67c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.67Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.77A5.86 5.86 0 0 1 6.23 12c0-.62.11-1.22.31-1.77V7.71H3.3A9.77 9.77 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.29l3.24-2.52Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.2c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.3 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.38l3.24 2.52C7.31 7.92 9.46 6.2 12 6.2Z"
      />
    </svg>
  );
}
