```tsx
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const raw = search["next"];

    return typeof raw === "string" &&
      raw.startsWith("/") &&
      !raw.startsWith("//")
      ? { next: raw }
      : {};
  },

  head: () => ({
    meta: [
      { title: "Sign in or create an account — Eze Pro Developer" },
      {
        name: "description",
        content:
          "Access your dashboard to track course progress, service requests and applications.",
      },
      {
        property: "og:title",
        content: "Sign in — Eze Pro Developer",
      },
      {
        property: "og:description",
        content:
          "Create an account to track your learning and applications.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: `${SITE.url}/auth`,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [
      {
        rel: "canonical",
        href: `${SITE.url}/auth`,
      },
    ],
  }),

  component: AuthPage,
});

const credentials = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function goNext(replace = false) {
    if (next) {
      window.location.href = next;
      return;
    }

    navigate({
      to: "/dashboard",
      replace,
    });
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.session.user.id,
        _role: "admin",
      });

      if (isAdmin) {
        navigate({
          to: "/admin",
          replace: true,
        });
      } else {
        goNext(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowResetPassword(true);
        return;
      }

      if (!session) return;

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      if (isAdmin) {
        navigate({
          to: "/admin",
          replace: true,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleSignIn(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const parsed = credentials.safeParse(
      Object.fromEntries(new FormData(e.currentTarget))
    );

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword(parsed.data);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.user) {
      toast.error("Login failed. Please try again.");
      return;
    }

    const { data: isAdmin, error: roleError } =
      await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });

    if (roleError) {
      toast.error("Unable to verify your account role.");
      return;
    }

    toast.success("Welcome back!");

    if (isAdmin) {
      navigate({
        to: "/admin",
        replace: true,
      });
    } else {
      goNext();
    }
  }

  async function handleSignUp(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const parsed = credentials.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }

    const fullName = String(fd.get("full_name") ?? "")
      .trim()
      .slice(0, 100);

    const province = String(fd.get("province") ?? "").trim();
    const district = String(fd.get("district") ?? "").trim();
    const sector = String(fd.get("sector") ?? "").trim();
    const cell = String(fd.get("cell") ?? "").trim();
    const village = String(fd.get("village") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();

    const ageValue = Number(fd.get("age"));

    const gender = String(fd.get("gender") ?? "").trim();

    if (!fullName) {
      toast.error("Enter your full name.");
      return;
    }

    if (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 120) {
      toast.error("Enter a valid age.");
      return;
    }

    if (!gender) {
      toast.error("Select your gender.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,

      options: {
        emailRedirectTo: next
          ? `${window.location.origin}${next}`
          : window.location.origin,

        data: {
          full_name: fullName,
          province,
          district,
          sector,
          cell,
          village,
          phone,
          age: ageValue,
          gender,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.user) {
      toast.error("Account creation failed.");
      return;
    }

    /*
     * If email confirmation is disabled, Supabase returns a session
     * and we can immediately save the profile.
     */
    if (data.session) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: fullName,
          province,
          district,
          sector,
          cell,
          village,
          phone,
          age: ageValue,
          gender,
          email: parsed.data.email,
        });

      if (profileError) {
        toast.error(
          "Account created, but profile information could not be saved."
        );
        return;
      }

      toast.success("Account created successfully!");
      goNext();
      return;
    }

    toast.success(
      "Account created. Check your email to confirm your account."
    );
  }

  async function handleForgotPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        {
          redirectTo: `${window.location.origin}/auth`,
        }
      );

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Password reset link sent. Check your email."
    );

    setShowForgotPassword(false);
  }

  async function handleUpdatePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully!");

    setNewPassword("");
    setConfirmPassword("");
    setShowResetPassword(false);

    await supabase.auth.signOut();

    navigate({
      to: "/auth",
      replace: true,
    });
  }

  async function handleGoogle() {
    const result =
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: next
          ? `${window.location.origin}${next}`
          : window.location.origin,
      });

    if (result.error) {
      toast.error(
        "Google sign-in failed. Please try again."
      );
      return;
    }

    if (result.redirected) return;

    goNext();
  }

  if (showResetPassword) {
    return (
      <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lift sm:p-8">
          <h1 className="text-center font-display text-2xl font-bold">
            Create new password
          </h1>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your new password below.
          </p>

          <form
            onSubmit={handleUpdatePassword}
            className="mt-6 grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="new-password">
                New password
              </Label>

              <Input
                id="new-password"
                type="password"
                minLength={8}
                maxLength={72}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">
                Confirm password
              </Label>

              <Input
                id="confirm-password"
                type="password"
                minLength={8}
                maxLength={72}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update password
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lift sm:p-8">
          <h1 className="text-center font-display text-2xl font-bold">
            Reset your password
          </h1>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your email and we will send you a reset link.
          </p>

          <form
            onSubmit={handleForgotPassword}
            className="mt-6 grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="reset-email">
                Email
              </Label>

              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) =>
                  setResetEmail(e.target.value)
                }
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send reset link
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setShowForgotPassword(false)
              }
            >
              Back to sign in
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-lift sm:p-8">
        <h1 className="text-center font-display text-2xl font-bold">
          Welcome to {SITE.shortName}
        </h1>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          Track your courses, requests and applications in one place.
        </p>

        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={handleGoogle}
        >
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">
              Sign in
            </TabsTrigger>

            <TabsTrigger value="signup">
              Create account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form
              onSubmit={handleSignIn}
              className="mt-4 grid gap-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="si-email">
                  Email
                </Label>

                <Input
                  id="si-email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="si-password">
                  Password
                </Label>

                <Input
                  id="si-password"
                  name="password"
                  type="password"
                  required
                  maxLength={72}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign in
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={() =>
                  setShowForgotPassword(true)
                }
              >
                Forgot password?
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form
              onSubmit={handleSignUp}
              className="mt-4 grid gap-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="su-name">
                  Full name
                </Label>

                <Input
                  id="su-name"
                  name="full_name"
                  required
                  maxLength={100}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="su-province">
                    Province
                  </Label>

                  <Input
                    id="su-province"
                    name="province"
                    placeholder="e.g. Eastern Province"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="su-district">
                    District
                  </Label>

                  <Input
                    id="su-district"
                    name="district"
                    placeholder="e.g. Nyagatare"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="su-sector">
                    Sector
                  </Label>

                  <Input
                    id="su-sector"
                    name="sector"
                    placeholder="Sector"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="su-cell">
                    Cell
                  </Label>

                  <Input
                    id="su-cell"
                    name="cell"
                    placeholder="Cell"
                    required
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="su-village">
                    Village
                  </Label>

                  <Input
                    id="su-village"
                    name="village"
                    placeholder="Village"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="su-phone">
                    Phone
                  </Label>

                  <Input
                    id="su-phone"
                    name="phone"
                    type="tel"
                    placeholder="+250..."
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="su-age">
                    Age
                  </Label>

                  <Input
                    id="su-age"
                    name="age"
                    type="number"
                    min={1}
                    max={120}
                    required
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="su-gender">
                    Gender
                  </Label>

                  <select
                    id="su-gender"
                    name="gender"
                    required
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="su-email">
                    Email
                  </Label>

                  <Input
                    id="su-email"
                    name="email"
                    type="email"
                    required
                    maxLength={255}
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="su-password">
                    Password
                  </Label>

                  <Input
                    id="su-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```
