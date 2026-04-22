"use client";

import React, { useCallback, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CreditCard,
  Cpu,
  Mic,
  Music,
  Settings,
  Trash2,
  Edit3,
  Wifi,
  WifiOff,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IOSettings {
  audioInterfaceId: string;
  inputChannel: string;
  outputChannel: string;
  bufferSize: string;
}

interface MIDIMapping {
  id: string;
  deviceName: string;
  channel: number;
  type: "cc" | "program_change";
  number: number;
  targetLabel: string;
}

interface MIDISettings {
  selectedDeviceId: string;
  mappings: MIDIMapping[];
  quickMapActive: boolean;
}

interface RecordingSettings {
  format: "wav" | "mp3" | "flac";
  sampleRate: "44100" | "48000" | "96000";
  bitDepth: "16" | "24" | "32";
}

interface AISettings {
  blendLevel: number;
  modelVersion: string;
  latency: number;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
}

interface CPUGPUSettings {
  processingPriority: "low" | "normal" | "high" | "realtime";
  gpuAcceleration: boolean;
}

interface SubscriptionInfo {
  tier: "free" | "classic" | "next_gen";
  status: "active" | "past_due" | "cancelled";
  renewalDate: number;
}

interface PaymentMethod {
  type: "credit_card" | "paypal";
  last4?: string;
  email?: string;
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_MIDI_MAPPINGS: MIDIMapping[] = [
  { id: "m1", deviceName: "MIDI Controller", channel: 1, type: "cc", number: 7, targetLabel: "Master Volume" },
  { id: "m2", deviceName: "MIDI Controller", channel: 1, type: "program_change", number: 1, targetLabel: "Clean Channel" },
  { id: "m3", deviceName: "MIDI Controller", channel: 1, type: "cc", number: 80, targetLabel: "Tube Screamer Toggle" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  // I/O
  const [io, setIO] = useState<IOSettings>({
    audioInterfaceId: "default",
    inputChannel: "1",
    outputChannel: "1-2",
    bufferSize: "256",
  });
  const [bufferWarningOpen, setBufferWarningOpen] = useState(false);
  const [pendingBufferSize, setPendingBufferSize] = useState<string | null>(null);

  // MIDI
  const [midi, setMIDI] = useState<MIDISettings>({
    selectedDeviceId: "controller-1",
    mappings: SEED_MIDI_MAPPINGS,
    quickMapActive: false,
  });

  // Recording
  const [recording, setRecording] = useState<RecordingSettings>({
    format: "wav",
    sampleRate: "48000",
    bitDepth: "24",
  });

  // AI
  const [ai, setAI] = useState<AISettings>({
    blendLevel: 50,
    modelVersion: "v2.4.1",
    latency: 32,
    connectionQuality: "good",
  });

  // CPU & GPU
  const [cpuGpu, setCpuGpu] = useState<CPUGPUSettings>({
    processingPriority: "high",
    gpuAcceleration: true,
  });

  // Subscription
  const [subscription] = useState<SubscriptionInfo>({
    tier: "classic",
    status: "active",
    renewalDate: Date.now() + 30 * 86400000,
  });

  // Payment
  const [paymentMethod] = useState<PaymentMethod>({
    type: "credit_card",
    last4: "4242",
  });

  // ── I/O handlers ──
  const handleBufferSizeChange = useCallback((value: string) => {
    setPendingBufferSize(value);
    setBufferWarningOpen(true);
  }, []);

  const confirmBufferChange = useCallback(() => {
    if (pendingBufferSize) {
      setIO((prev) => ({ ...prev, bufferSize: pendingBufferSize }));
    }
    setPendingBufferSize(null);
    setBufferWarningOpen(false);
  }, [pendingBufferSize]);

  // ── MIDI handlers ──
  const handleDeleteMapping = useCallback((id: string) => {
    setMIDI((prev) => ({
      ...prev,
      mappings: prev.mappings.filter((m) => m.id !== id),
    }));
  }, []);

  const handleToggleQuickMap = useCallback(() => {
    setMIDI((prev) => ({ ...prev, quickMapActive: !prev.quickMapActive }));
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-8 min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border p-4",
          "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
          "shadow-[var(--glass-shadow)]",
        )}
      >
        <Settings className="h-6 w-6 text-[var(--brand-accent)]" />
        <h1 className="text-lg font-bold uppercase tracking-wider">Settings</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="io" className="w-full">
        <div
          className={cn(
            "rounded-xl border p-2",
            "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
            "shadow-[var(--glass-shadow)]",
          )}
        >
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent">
            <TabsTrigger value="io" className="gap-1.5 text-xs"><Mic className="h-3.5 w-3.5" />I/O</TabsTrigger>
            <TabsTrigger value="midi" className="gap-1.5 text-xs"><Music className="h-3.5 w-3.5" />MIDI</TabsTrigger>
            <TabsTrigger value="recording" className="gap-1.5 text-xs"><Mic className="h-3.5 w-3.5" />Recording</TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5 text-xs"><Brain className="h-3.5 w-3.5" />AI</TabsTrigger>
            <TabsTrigger value="cpu-gpu" className="gap-1.5 text-xs"><Cpu className="h-3.5 w-3.5" />CPU &amp; GPU</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-xs"><Crown className="h-3.5 w-3.5" />Subscriptions</TabsTrigger>
            <TabsTrigger value="payment" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" />Payment</TabsTrigger>
          </TabsList>
        </div>

        {/* ── I/O Interface Options ── */}
        <TabsContent value="io">
          <IOSection
            settings={io}
            onInterfaceChange={(v) => setIO((p) => ({ ...p, audioInterfaceId: v }))}
            onInputChange={(v) => setIO((p) => ({ ...p, inputChannel: v }))}
            onOutputChange={(v) => setIO((p) => ({ ...p, outputChannel: v }))}
            onBufferSizeChange={handleBufferSizeChange}
          />
        </TabsContent>

        {/* ── MIDI Options ── */}
        <TabsContent value="midi">
          <MIDISection
            settings={midi}
            onDeviceChange={(v) => setMIDI((p) => ({ ...p, selectedDeviceId: v }))}
            onDeleteMapping={handleDeleteMapping}
            onToggleQuickMap={handleToggleQuickMap}
          />
        </TabsContent>

        {/* ── Recording Options ── */}
        <TabsContent value="recording">
          <RecordingSection
            settings={recording}
            onFormatChange={(v) => setRecording((p) => ({ ...p, format: v as RecordingSettings["format"] }))}
            onSampleRateChange={(v) => setRecording((p) => ({ ...p, sampleRate: v as RecordingSettings["sampleRate"] }))}
            onBitDepthChange={(v) => setRecording((p) => ({ ...p, bitDepth: v as RecordingSettings["bitDepth"] }))}
          />
        </TabsContent>

        {/* ── AI Settings ── */}
        <TabsContent value="ai">
          <AISection
            settings={ai}
            onBlendChange={(v) => setAI((p) => ({ ...p, blendLevel: v }))}
          />
        </TabsContent>

        {/* ── CPU & GPU ── */}
        <TabsContent value="cpu-gpu">
          <CPUGPUSection
            settings={cpuGpu}
            onPriorityChange={(v) => setCpuGpu((p) => ({ ...p, processingPriority: v as CPUGPUSettings["processingPriority"] }))}
            onGpuToggle={(v) => setCpuGpu((p) => ({ ...p, gpuAcceleration: v }))}
          />
        </TabsContent>

        {/* ── Subscriptions ── */}
        <TabsContent value="subscriptions">
          <SubscriptionsSection subscription={subscription} />
        </TabsContent>

        {/* ── Payment ── */}
        <TabsContent value="payment">
          <PaymentSection paymentMethod={paymentMethod} />
        </TabsContent>
      </Tabs>

      {/* Buffer size warning dialog */}
      <AlertDialog open={bufferWarningOpen} onOpenChange={setBufferWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Audio Engine Restart Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing the buffer size to {pendingBufferSize} samples requires restarting the audio engine. This will briefly interrupt audio output.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingBufferSize(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBufferChange}>Restart Engine</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


// ---------------------------------------------------------------------------
// I/O Interface Options Section
// ---------------------------------------------------------------------------

function IOSection({
  settings,
  onInterfaceChange,
  onInputChange,
  onOutputChange,
  onBufferSizeChange,
}: {
  settings: IOSettings;
  onInterfaceChange: (v: string) => void;
  onInputChange: (v: string) => void;
  onOutputChange: (v: string) => void;
  onBufferSizeChange: (v: string) => void;
}) {
  return (
    <GlassCard title="I/O Interface Options" icon={<Mic className="h-5 w-5" />}>
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingRow label="Audio Interface">
          <Select value={settings.audioInterfaceId} onValueChange={onInterfaceChange}>
            <SelectTrigger aria-label="Audio interface selection">
              <SelectValue placeholder="Select interface" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">System Default</SelectItem>
              <SelectItem value="focusrite-2i2">Focusrite Scarlett 2i2</SelectItem>
              <SelectItem value="ua-apollo">Universal Audio Apollo Twin</SelectItem>
              <SelectItem value="motu-m2">MOTU M2</SelectItem>
              <SelectItem value="presonus-24c">PreSonus Studio 24c</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow label="Input Channel">
          <Select value={settings.inputChannel} onValueChange={onInputChange}>
            <SelectTrigger aria-label="Input channel selection">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Input 1 (Mono)</SelectItem>
              <SelectItem value="2">Input 2 (Mono)</SelectItem>
              <SelectItem value="1-2">Input 1-2 (Stereo)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow label="Output Channel">
          <Select value={settings.outputChannel} onValueChange={onOutputChange}>
            <SelectTrigger aria-label="Output channel selection">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-2">Output 1-2 (Stereo)</SelectItem>
              <SelectItem value="3-4">Output 3-4 (Stereo)</SelectItem>
              <SelectItem value="1">Output 1 (Mono)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow label="Buffer Size">
          <div className="flex items-center gap-2">
            <Select value={settings.bufferSize} onValueChange={onBufferSizeChange}>
              <SelectTrigger aria-label="Buffer size selection">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="64">64 samples (~1.5ms)</SelectItem>
                <SelectItem value="128">128 samples (~2.9ms)</SelectItem>
                <SelectItem value="256">256 samples (~5.8ms)</SelectItem>
                <SelectItem value="512">512 samples (~11.6ms)</SelectItem>
                <SelectItem value="1024">1024 samples (~23.2ms)</SelectItem>
              </SelectContent>
            </Select>
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-label="Changing buffer size requires audio engine restart" />
          </div>
        </SettingRow>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// MIDI Options Section
// ---------------------------------------------------------------------------

function MIDISection({
  settings,
  onDeviceChange,
  onDeleteMapping,
  onToggleQuickMap,
}: {
  settings: MIDISettings;
  onDeviceChange: (v: string) => void;
  onDeleteMapping: (id: string) => void;
  onToggleQuickMap: () => void;
}) {
  return (
    <GlassCard title="MIDI Options" icon={<Music className="h-5 w-5" />}>
      <div className="grid gap-5">
        <SettingRow label="MIDI Device">
          <Select value={settings.selectedDeviceId} onValueChange={onDeviceChange}>
            <SelectTrigger aria-label="MIDI device selection">
              <SelectValue placeholder="Select MIDI device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="controller-1">MIDI Controller (USB)</SelectItem>
              <SelectItem value="keyboard-1">MIDI Keyboard (Bluetooth)</SelectItem>
              <SelectItem value="none">No Device</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Quick-Map Mode</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Activate to map the next MIDI input to a parameter
            </p>
          </div>
          <Button
            size="sm"
            variant={settings.quickMapActive ? "default" : "outline"}
            onClick={onToggleQuickMap}
            aria-label={settings.quickMapActive ? "Cancel quick-map" : "Start quick-map"}
          >
            {settings.quickMapActive ? "Listening…" : "Quick-Map"}
          </Button>
        </div>

        {/* Mapping list */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Active Mappings</Label>
          {settings.mappings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No MIDI mappings configured.</p>
          ) : (
            <div className="space-y-2">
              {settings.mappings.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate">{m.targetLabel}</span>
                    <span className="text-xs text-muted-foreground">
                      Ch {m.channel} · {m.type === "cc" ? `CC ${m.number}` : `PC ${m.number}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Edit mapping for ${m.targetLabel}`}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDeleteMapping(m.id)}
                      aria-label={`Delete mapping for ${m.targetLabel}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}


// ---------------------------------------------------------------------------
// Recording Options Section
// ---------------------------------------------------------------------------

function RecordingSection({
  settings,
  onFormatChange,
  onSampleRateChange,
  onBitDepthChange,
}: {
  settings: RecordingSettings;
  onFormatChange: (v: string) => void;
  onSampleRateChange: (v: string) => void;
  onBitDepthChange: (v: string) => void;
}) {
  return (
    <GlassCard title="Recording Options" icon={<Mic className="h-5 w-5" />}>
      <div className="grid gap-5 sm:grid-cols-3">
        <SettingRow label="Format">
          <Select value={settings.format} onValueChange={onFormatChange}>
            <SelectTrigger aria-label="Recording format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wav">WAV (Lossless)</SelectItem>
              <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
              <SelectItem value="flac">FLAC (Lossless Compressed)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow label="Sample Rate">
          <Select value={settings.sampleRate} onValueChange={onSampleRateChange}>
            <SelectTrigger aria-label="Sample rate">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="44100">44.1 kHz</SelectItem>
              <SelectItem value="48000">48 kHz</SelectItem>
              <SelectItem value="96000">96 kHz</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow label="Bit Depth">
          <Select value={settings.bitDepth} onValueChange={onBitDepthChange}>
            <SelectTrigger aria-label="Bit depth">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16">16-bit</SelectItem>
              <SelectItem value="24">24-bit</SelectItem>
              <SelectItem value="32">32-bit float</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// AI Settings Section
// ---------------------------------------------------------------------------

const CONNECTION_QUALITY_CONFIG: Record<AISettings["connectionQuality"], { label: string; color: string; icon: React.ReactNode }> = {
  excellent: { label: "Excellent", color: "bg-emerald-500", icon: <Wifi className="h-4 w-4 text-emerald-500" /> },
  good: { label: "Good", color: "bg-amber-500", icon: <Wifi className="h-4 w-4 text-amber-500" /> },
  poor: { label: "Poor", color: "bg-red-500", icon: <Wifi className="h-4 w-4 text-red-500" /> },
  disconnected: { label: "Disconnected", color: "bg-zinc-500", icon: <WifiOff className="h-4 w-4 text-zinc-500" /> },
};

function AISection({
  settings,
  onBlendChange,
}: {
  settings: AISettings;
  onBlendChange: (v: number) => void;
}) {
  const qualityInfo = CONNECTION_QUALITY_CONFIG[settings.connectionQuality];

  return (
    <GlassCard title="AI Settings" icon={<Brain className="h-5 w-5" />}>
      <div className="grid gap-5">
        {/* Blend level slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">AI Blend Level</Label>
            <span className="text-sm font-bold tabular-nums">{settings.blendLevel}%</span>
          </div>
          <Slider
            value={[settings.blendLevel]}
            onValueChange={([v]) => onBlendChange(v)}
            min={0}
            max={100}
            step={1}
            aria-label="AI blend level"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">DSP Only</span>
            <span className="text-xs text-muted-foreground">Full AI</span>
          </div>
        </div>

        {/* Neural network status */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Neural Network Status</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatusCard label="Model Version" value={settings.modelVersion} />
            <StatusCard
              label="Latency"
              value={`${settings.latency}ms`}
              badge={settings.latency > 50 ? "warning" : undefined}
            />
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground block mb-1">Connection</span>
              <div className="flex items-center gap-2">
                {qualityInfo.icon}
                <span className="text-sm font-medium">{qualityInfo.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// CPU & GPU Settings Section
// ---------------------------------------------------------------------------

function CPUGPUSection({
  settings,
  onPriorityChange,
  onGpuToggle,
}: {
  settings: CPUGPUSettings;
  onPriorityChange: (v: string) => void;
  onGpuToggle: (v: boolean) => void;
}) {
  return (
    <GlassCard title="CPU & GPU Settings" icon={<Cpu className="h-5 w-5" />}>
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingRow label="Processing Priority">
          <Select value={settings.processingPriority} onValueChange={onPriorityChange}>
            <SelectTrigger aria-label="Processing priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="realtime">Real-time</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm font-medium">GPU Acceleration</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use GPU for IR convolution processing
            </p>
          </div>
          <Switch
            checked={settings.gpuAcceleration}
            onCheckedChange={onGpuToggle}
            aria-label="Toggle GPU acceleration"
          />
        </div>
      </div>
    </GlassCard>
  );
}


// ---------------------------------------------------------------------------
// Subscriptions Section
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<SubscriptionInfo["tier"], string> = {
  free: "Free",
  classic: "Classic",
  next_gen: "Next Gen",
};

const TIER_BADGE_VARIANT: Record<SubscriptionInfo["tier"], "default" | "secondary" | "outline"> = {
  free: "outline",
  classic: "secondary",
  next_gen: "default",
};

function SubscriptionsSection({ subscription }: { subscription: SubscriptionInfo }) {
  const renewalFormatted = new Date(subscription.renewalDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <GlassCard title="Subscriptions" icon={<Crown className="h-5 w-5" />}>
      <div className="grid gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">Current Plan</span>
              <Badge variant={TIER_BADGE_VARIANT[subscription.tier]}>
                {TIER_LABELS[subscription.tier]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Status: <span className="capitalize">{subscription.status.replace("_", " ")}</span>
              {subscription.status === "active" && ` · Renews ${renewalFormatted}`}
            </p>
          </div>
          <div className="flex gap-2">
            {subscription.tier !== "next_gen" && (
              <Button size="sm" aria-label="Upgrade subscription">Upgrade</Button>
            )}
            {subscription.tier !== "free" && (
              <Button size="sm" variant="outline" aria-label="Downgrade subscription">Downgrade</Button>
            )}
          </div>
        </div>

        {/* Tier comparison */}
        <div className="grid gap-3 sm:grid-cols-3">
          <TierCard
            name="Free"
            price="$0"
            features={["1 Amp Model", "3 FX Pedals", "1 Cabinet", "DSP Processing"]}
            isCurrent={subscription.tier === "free"}
          />
          <TierCard
            name="Classic"
            price="$9.99/mo"
            features={["All Amp Models", "All FX Pedals", "All Cabinets", "DSP Processing"]}
            isCurrent={subscription.tier === "classic"}
          />
          <TierCard
            name="Next Gen"
            price="$19.99/mo"
            features={["Everything in Classic", "AI Neural Enhancement", "Priority Support", "Cloud Processing"]}
            isCurrent={subscription.tier === "next_gen"}
            highlighted
          />
        </div>
      </div>
    </GlassCard>
  );
}

function TierCard({
  name,
  price,
  features,
  isCurrent,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        highlighted ? "border-[var(--brand-accent)]/50 bg-[var(--brand-accent)]/5" : "border-border/50 bg-muted/30",
        isCurrent && "ring-2 ring-[var(--brand-accent)]/50",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold">{name}</span>
        {isCurrent && <Badge variant="outline" className="text-[10px]">Current</Badge>}
      </div>
      <p className="text-lg font-bold mb-3">{price}</p>
      <ul className="space-y-1">
        {features.map((f) => (
          <li key={f} className="text-xs text-muted-foreground">• {f}</li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Payment Section
// ---------------------------------------------------------------------------

function PaymentSection({ paymentMethod }: { paymentMethod: PaymentMethod }) {
  return (
    <GlassCard title="Payment" icon={<CreditCard className="h-5 w-5" />}>
      <div className="grid gap-5">
        <p className="text-xs text-muted-foreground">
          Payment is processed securely via Stripe. We never store your card details.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <span className="text-sm font-medium block">
                {paymentMethod.type === "credit_card"
                  ? `Credit Card ending in ${paymentMethod.last4}`
                  : `PayPal (${paymentMethod.email})`}
              </span>
              <span className="text-xs text-muted-foreground">
                {paymentMethod.type === "credit_card" ? "Visa" : "PayPal"}
              </span>
            </div>
          </div>
          <Button size="sm" variant="outline" aria-label="Update payment method">
            Update
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" aria-label="Add credit card">
            <CreditCard className="h-3.5 w-3.5" />
            Add Card
          </Button>
          <Button size="sm" variant="outline" aria-label="Add PayPal">
            Add PayPal
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Shared UI helpers
// ---------------------------------------------------------------------------

function GlassCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]",
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
          <span className="text-[var(--brand-accent)]">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function StatusCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "warning";
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
      <span className="text-xs text-muted-foreground block mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {badge === "warning" && (
          <Badge variant="destructive" className="text-[10px]">High</Badge>
        )}
      </div>
    </div>
  );
}
