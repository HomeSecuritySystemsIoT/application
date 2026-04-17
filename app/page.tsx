import Link from "next/link"
import { getCurrentSession } from "@/lib/session"
import {
  Shield,
  Cpu,
  Eye,
  Lock,
  ArrowRight,
  Star,
  Wifi,
  DollarSign,
  GitPullRequestArrow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Cpu,
    title: "Built for ESP32-CAM",
    description:
      "Flash our open-source firmware onto any ESP32-CAM board. A full setup — board included — costs under €15.",
  },
  {
    icon: Lock,
    title: "Private by design",
    description:
      "Your stream is encrypted end-to-end. Your footage never touches a third-party server. You own every byte.",
  },
  {
    icon: Eye,
    title: "Watch from anywhere",
    description:
      "Access your live feed from any browser, on any device. No app download, no proprietary software.",
  },
  {
    icon: Shield,
    title: "Fully open source",
    description:
      "Every line of firmware and backend code is public. Audit it, fork it, self-host it. No vendor lock-in, ever.",
  },
]

const steps = [
  {
    number: "01",
    title: "Get your hardware",
    description:
      "Pick up an ESP32-CAM from any electronics store or online marketplace. They're widely available for under €10.",
  },
  {
    number: "02",
    title: "Flash & connect",
    description:
      "Run our one-command installer to flash the firmware. The device discovers your account automatically over Wi-Fi.",
  },
  {
    number: "03",
    title: "Watch your feed",
    description:
      "Log in to your dashboard and see your cameras live within seconds. Motion alerts and recordings included.",
  },
]

const reviews = [
  {
    name: "Sarah Mitchell",
    role: "Home Owner",
    text: "Finally a security camera I actually trust. Setup took 20 minutes and the stream is crystal clear. Replaced my entire Nest setup for under €30.",
  },
  {
    name: "James Rodriguez",
    role: "Software Engineer",
    text: "Being able to read every line of code that touches my cameras is priceless. I've already contributed a motion-detection tweak to the firmware.",
  },
  {
    name: "Emma Thompson",
    role: "Small Business Owner",
    text: "Five cameras across my shop, all running perfectly for four months. Zero downtime. I genuinely can't believe this is free.",
  },
  {
    name: "David Kim",
    role: "Privacy Advocate",
    text: "The board costs €8 and the software is completely free. I used to pay $25/month for a cloud service with worse image quality.",
  },
  {
    name: "Aisha Patel",
    role: "Tech Enthusiast",
    text: "Self-hosted on my home server in an afternoon. The docs are excellent, the community on GitHub is super helpful. Exactly what I was looking for.",
  },
  {
    name: "Lucas Schneider",
    role: "Security Researcher",
    text: "I audited the encryption implementation before deploying it. It's solid. Rare to see this level of care in an open-source IoT project.",
  },
  {
    name: "Yuki Tanaka",
    role: "Maker & Tinkerer",
    text: "Extended it with Telegram motion alerts in an evening. The firmware is clean, well-commented, and genuinely pleasant to work with.",
  },
  {
    name: "Olivia Martins",
    role: "Parent",
    text: "Using it as a baby monitor. Great quality, no subscription, and my footage stays on my own server. Would recommend to anyone.",
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-600",
  "bg-teal-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
]

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function Page() {
  const { user } = await getCurrentSession()
  const doubled = [...reviews, ...reviews]

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
          {/* badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-green-500" />
            Open Source · Free · Self-hosted
          </span>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your home.{" "}
            <span className="text-muted-foreground">Your cameras.</span>{" "}
            Your&nbsp;control.
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            OpenCam turns a €10 ESP32-CAM into a private, live security camera.
            No subscriptions. No cloud lock-in. Just your footage, always yours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={user ? "/dashboard" : "/auth/signup"}>
                {user ? "Dashboard" : "Get started"}{" "}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitPullRequestArrow className="size-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto grid max-w-4xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: DollarSign, value: "< €15", label: "Full setup cost" },
            { icon: Wifi, value: "100%", label: "Private & self-hosted" },
            {
              icon: GitPullRequestArrow,
              value: "MIT",
              label: "Open-source licence",
            },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1 px-8 py-10"
            >
              <Icon className="mb-1 size-5 text-muted-foreground" />
              <span className="text-3xl font-bold">{value}</span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built by developers who were tired of paying for overpriced,
            closed-source security systems.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="flex gap-4 p-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── How it works ── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in minutes.
          </h2>
          <p className="mt-3 text-muted-foreground">
            No electrical engineering degree required.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col gap-3">
              <span className="text-5xl font-bold text-muted-foreground/25">
                {number}
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Reviews ── */}
      <section className="py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by makers and homeowners alike.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real people who got tired of paying too much for too little.
          </p>
        </div>

        {/* Carousel — pure CSS, no deps */}
        <div
          className="overflow-hidden py-px"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          {/* Each slot = 344px (320px card + 24px gap-right).
              16 slots total → total width = 5504px.
              translateX(-50%) = -2752px = exactly 8 slots → seamless loop. */}
          <div className="carousel-track flex">
            {doubled.map((review, i) => (
              <div key={i} className="w-[344px] shrink-0 pr-6">
                <Card className="h-full w-[320px]">
                  <CardContent className="flex h-full flex-col gap-4 p-5">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className="size-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    {/* Reviewer */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(review.name)}`}
                      >
                        {initials(review.name)}
                      </div>
                      <div>
                        <p className="text-sm leading-none font-medium">
                          {review.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {review.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── CTA ── */}
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to take back control?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Create a free account, flash your first ESP32-CAM, and have a live
          feed running in under 30 minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/auth/signup">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Free forever. No credit card required.
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-medium">OpenCam</span>
          <p className="text-xs text-muted-foreground">
            Open-source IoT security cameras. MIT licence.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitPullRequestArrow className="size-4" />
          </a>
        </div>
      </footer>
    </div>
  )
}
