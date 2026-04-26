export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          Secured{" "}
          <span className="text-[var(--brand-accent)]">Privacy</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Our privacy policy, written in plain language. No legalese, no
          surprises.
        </p>
      </div>

      <div className="mt-16 space-y-8">
        <Section title="What We Collect">
          <p>
            When you create an account, we collect your email address and
            display name. If you subscribe to a paid tier, our payment processor
            (Stripe) handles your payment information — we never see or store
            your card number.
          </p>
          <p>
            We also store your signal chain configurations, MIDI mappings, and
            app settings so they sync across your devices.
          </p>
        </Section>

        <Section title="How We Use Your Data">
          <p>
            Your data is used to provide the AmpSim service: syncing your
            settings, managing your subscription, and personalizing your
            experience. We don&apos;t sell your data to third parties. Period.
          </p>
        </Section>

        <Section title="Audio Data & AI Processing">
          <p>
            If you&apos;re on the Next Gen tier and enable AI enhancement, your
            processed audio is sent to our AI engine for tonal analysis. This
            audio is processed in real time and is not stored or used for
            training purposes. You can disable AI processing at any time, and
            audio transmission stops immediately.
          </p>
          <p>
            Free and Classic tier users: your audio never leaves your device.
            All DSP processing happens locally.
          </p>
        </Section>

        <Section title="Data Security">
          <p>
            All data transmitted between your device and our servers is
            encrypted using TLS 1.2 or higher. Passwords are hashed using
            industry-standard algorithms with per-user salts. We follow security
            best practices to protect your account.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>
            You can export all your data or delete your account at any time from
            your profile settings. When you delete your account, all your data
            is permanently removed from our systems. We comply with GDPR and
            applicable data protection regulations.
          </p>
        </Section>

        <Section title="Cookies & Analytics">
          <p>
            We use essential cookies to keep you logged in and remember your
            preferences. We may use anonymous analytics to understand how the
            platform is used and improve the experience. We don&apos;t use
            tracking cookies for advertising.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            If we make significant changes to this policy, we&apos;ll notify
            you via email and in-app notification before the changes take
            effect.
          </p>
        </Section>

        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
      <h2 className="font-quicksand text-xl font-bold">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
