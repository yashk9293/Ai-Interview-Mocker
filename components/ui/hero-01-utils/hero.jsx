import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// avatarList: [{ icon, label, tint }] — the kinds of roles people practise for.
// (A real user photo can be used instead: { image, label }.)
export default function HeroSection({ avatarList }) {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden">
      {/* Soft brand glow behind the headline */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center">
        <div className="h-[520px] w-[900px] rounded-full bg-brand/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-10 text-center sm:px-6 lg:px-8 lg:py-6">
        <Link
          href="/how-it-works"
          className="fade-up group inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3 py-1 text-sm font-medium text-primary transition-colors hover:border-brand/40"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Instant AI feedback on every answer
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold tracking-[-0.035em] text-foreground sm:text-6xl lg:text-7xl">
          <span className="mask-line"><span>Ace your next interview</span></span>
          <span className="mask-line"><span>by practising <span className="text-primary">out loud</span></span></span>
        </h1>

        <p className="fade-up mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Tell us the job. Our AI asks five questions for your exact role, listens to your spoken answers,
          and rates each one out of 10 with feedback and a model answer.
        </p>

        <div className="fade-up mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="h-12 w-full rounded-full px-7 text-base sm:w-auto">
            <Link href="/dashboard">
              Start a mock interview <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full px-7 text-base sm:w-auto">
            <Link href="/how-it-works">See how it works</Link>
          </Button>
        </div>

        <div className="fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <div className="flex -space-x-3">
            {avatarList.map((avatar) => (
              <span
                key={avatar.label}
                title={avatar.label}
                className="flex size-11 items-center justify-center overflow-hidden rounded-full border-2 border-white"
                style={{ background: avatar.tint }}
              >
                {avatar.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar.image} alt={avatar.label} className="size-full object-cover" />
                ) : (
                  <avatar.icon className="size-5 text-primary" aria-hidden="true" />
                )}
                <span className="sr-only">{avatar.label}</span>
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Built for <span className="font-semibold text-foreground">engineering, data, product and design</span> roles
          </p>
        </div>
      </div>
    </section>
  );
}
