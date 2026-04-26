export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          Not Your Typical{" "}
          <span className="text-[var(--brand-accent)]">Terms</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Our terms of service, written like humans talking to humans.
        </p>
      </div>

      <div className="mt-16 space-y-8">
        <Section title="The Basics">
          <p>
            AmpSim is a guitar amplifier and effects simulation platform. By
            creating an account and using the service, you agree to these terms.
            If something here doesn&apos;t sit right with you, reach out — we&apos;re
            happy to talk.
          </p>
        </Section>

        <Section title="Your Account">
          <p>
            You&apos;re responsible for keeping your login credentials secure.
            Use a strong password and don&apos;t share your account. If you
            suspect unauthorized access, let us know immediately and we&apos;ll
            help you secure it.
          </p>
        </Section>

        <Section title="Subscriptions & Payments">
          <p>
            AmpSim offers three tiers: Free, Classic ($9.99/month), and Next Gen
            ($19.99/month). Paid subscriptions renew automatically. You can
            cancel anytime from your settings — you&apos;ll keep access until
            the end of your billing period.
          </p>
          <p>
            If a payment fails, we&apos;ll notify you and give you time to
            update your payment method. If it&apos;s not resolved, your account
            will be downgraded to the Free tier. You won&apos;t lose your saved
            data.
          </p>
        </Section>

        <Section title="What You Can Do">
          <p>
            Use AmpSim for personal and professional music creation, practice,
            recording, and live performance. Your signal chains, recordings, and
            settings belong to you.
          </p>
        </Section>

        <Section title="What You Can't Do">
          <p>
            Don&apos;t reverse-engineer the DSP engine or AI models. Don&apos;t
            use the platform to distribute malware or abuse our infrastructure.
            Don&apos;t create accounts for the purpose of circumventing
            subscription limits. Basically: be cool.
          </p>
        </Section>

        <Section title="Our Responsibilities">
          <p>
            We&apos;ll do our best to keep AmpSim running smoothly and your
            data safe. We aim for high uptime but can&apos;t guarantee 100%
            availability — sometimes things break, and we fix them as fast as we
            can. The DSP engine runs on your device, so it works even when our
            servers don&apos;t.
          </p>
        </Section>

        <Section title="Content & Brand Identity">
          <p>
            All amp models, pedal simulations, and brand identities (MAC, KING,
            Manhattan, TOKYO) are proprietary to AmpSim. They&apos;re inspired
            by real-world hardware but are our own creative interpretations
            under renamed brand identities.
          </p>
        </Section>

        <Section title="Termination">
          <p>
            You can delete your account at any time. We may suspend accounts
            that violate these terms, but we&apos;ll always try to reach out
            first. If we ever shut down the service (we don&apos;t plan to),
            we&apos;ll give you plenty of notice and a way to export your data.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            If we update these terms, we&apos;ll let you know via email and
            in-app notification at least 30 days before the changes take effect.
            Continued use after that means you accept the new terms.
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
