"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2, User } from "lucide-react";
import type { UserProfile, SubscriptionTier } from "@/types/user";

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  classic: "Classic",
  next_gen: "Next Gen",
};

// Placeholder profile until Convex auth is wired
const PLACEHOLDER_PROFILE: UserProfile = {
  id: "placeholder",
  email: "user@example.com",
  displayName: "Guitar Player",
  tier: "free",
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
};

export default function ProfilePage() {
  const [profile] = useState<UserProfile>(PLACEHOLDER_PROFILE);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }

    setIsSaving(true);

    // Simulate save — Convex integration will be wired later
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
    }, 500);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          View and edit your account information.
        </p>
      </div>

      <Card className="backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
          <CardDescription>
            Manage your profile and subscription.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {saved && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>Profile saved successfully.</AlertDescription>
              </Alert>
            )}

            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{profile.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {TIER_LABELS[profile.tier]} tier
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-display-name">Display Name</Label>
              <Input
                id="profile-display-name"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profile.email}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Subscription</Label>
              <p className="text-sm">{TIER_LABELS[profile.tier]}</p>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
