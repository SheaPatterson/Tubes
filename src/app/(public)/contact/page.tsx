import { Mail, MessageSquare, MapPin } from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support requests.",
    detail: "support@ampsim.io",
  },
  {
    icon: MessageSquare,
    title: "Community",
    description: "Join the conversation with other AmpSim users.",
    detail: "discord.gg/ampsim",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Our team works remotely across the globe.",
    detail: "Worldwide",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          Who to <span className="text-[var(--brand-accent)]">Contact</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Got a question, feature request, or just want to talk tone? We&apos;d
          love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {contactMethods.map((method) => (
          <div
            key={method.title}
            className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 text-center backdrop-blur-[var(--glass-blur-sm)]"
          >
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
              <method.icon className="h-5 w-5 text-[var(--brand-accent)]" />
            </div>
            <h3 className="font-quicksand text-lg font-semibold">
              {method.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {method.description}
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--brand-accent)]">
              {method.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div className="mt-16 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
        <h2 className="font-quicksand text-2xl font-bold">Send a Message</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill out the form below and we&apos;ll get back to you within 24
          hours.
        </p>
        <form className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact-name"
                className="mb-1 block text-sm font-medium"
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your name"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="mb-1 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="contact-subject"
              className="mb-1 block text-sm font-medium"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              placeholder="What's this about?"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="mb-1 block text-sm font-medium"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="Tell us what's on your mind..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[var(--brand-accent)] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-accent-hover)]"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
