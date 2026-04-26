"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Loader2, Mail } from "lucide-react";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isLocked) {
      const remainingSec = Math.ceil((lockedUntil! - Date.now()) / 1000);
      setError(
        `Account is temporarily locked. Please try again in ${remainingSec} seconds.`
      );
      return;
    }

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsLoading(true);

    // Simulate auth call — Convex integration will be wired later
    setTimeout(() => {
      setIsLoading(false);

      // Placeholder: always treat as failed for now
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockedUntil(lockTime);
        setError(
          "Too many failed login attempts. Your account has been locked for 60 seconds."
        );
        // Reset counter after lockout expires
        setTimeout(() => {
          setLockedUntil(null);
          setFailedAttempts(0);
        }, LOCKOUT_DURATION_MS);
      } else {
        setError(
          `Invalid email or password. ${MAX_FAILED_ATTEMPTS - newAttempts} attempt(s) remaining before account lock.`
        );
      }
    }, 600);
  }

  function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    // Simulate sending reset email — Convex integration later
    setResetSent(true);
  }

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send a password reset link valid for
            30 minutes.
          </CardDescription>
        </CardHeader>
        {resetSent ? (
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                If an account exists for <strong>{resetEmail}</strong>, a
                password reset link has been sent. The link expires in 30
                minutes.
              </AlertDescription>
            </Alert>
            <Button
              variant="ghost"
              className="gap-1"
              onClick={() => {
                setShowForgotPassword(false);
                setResetSent(false);
                setResetEmail("");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <CardContent className="space-y-4">
              {resetError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resetError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-1"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetError(null);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your AmpSim account to access your rig.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLocked}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isLocked}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLocked ? "Account Locked" : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
