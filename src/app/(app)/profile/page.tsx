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
import {
  AlertCircle,
  Check,
  Download,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import type { UserProfile, SubscriptionTier } from "@/types/user";
import type { GDPRExportData } from "@/lib/gdpr";
import { downloadExportAsJSON } from "@/lib/gdpr";

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

      {/* GDPR Data Rights — Validates: Requirement 22.4 */}
      <GDPRSection profile={profile} />
    </div>
  );
}

// ── GDPR Data Rights Section ──

function GDPRSection({ profile }: { profile: UserProfile }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [gdprMessage, setGdprMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleExportData() {
    setIsExporting(true);
    setGdprMessage(null);

    try {
      // Build a placeholder export from the current profile data.
      // In production this calls Convex queries via exportUserData().
      const exportData: GDPRExportData = {
        exportedAt: new Date().toISOString(),
        profile: {
          email: profile.email,
          displayName: profile.displayName,
          tier: profile.tier,
          createdAt: new Date(profile.createdAt).toISOString(),
          lastLoginAt: new Date(profile.lastLoginAt).toISOString(),
        },
        bio: null,
        signalChains: [],
        midiMappings: [],
        settings: null,
        subscription: null,
      };

      downloadExportAsJSON(exportData);
      setGdprMessage({
        type: "success",
        text: "Your data export has been downloaded.",
      });
    } catch {
      setGdprMessage({
        type: "error",
        text: "Failed to export data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;

    setIsDeleting(true);
    setGdprMessage(null);

    try {
      // In production this calls requestAccountDeletion() via Convex.
      // Placeholder: simulate the deletion request.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setGdprMessage({
        type: "success",
        text: "Account deletion request submitted. You will be logged out shortly.",
      });
    } catch {
      setGdprMessage({
        type: "error",
        text: "Failed to delete account. Please try again or contact support.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
      <CardHeader>
        <CardTitle className="text-lg">Data &amp; Privacy</CardTitle>
        <CardDescription>
          Export your data or delete your account. These actions comply with GDPR
          data subject rights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {gdprMessage && (
          <Alert variant={gdprMessage.type === "error" ? "destructive" : "default"}>
            {gdprMessage.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <AlertDescription>{gdprMessage.text}</AlertDescription>
          </Alert>
        )}

        {/* Data Export */}
        <div className="space-y-2">
          <Label>Export Your Data</Label>
          <p className="text-xs text-muted-foreground">
            Download a copy of all your data including profile, signal chains,
            MIDI mappings, and settings.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={isExporting}
            aria-label="Export all personal data"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export Data
          </Button>
        </div>

        {/* Account Deletion */}
        <div className="space-y-2 border-t border-border/50 pt-4">
          <Label className="text-destructive">Delete Account</Label>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="max-w-[200px]"
              aria-label="Type DELETE to confirm account deletion"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE" || isDeleting}
              aria-label="Permanently delete account"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
