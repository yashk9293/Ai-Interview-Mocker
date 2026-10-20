import { ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Pricing cards. Each tier:
// { id, name, description, price, frequency, features: [{ text, included }],
//   popular?, cta: { label, href?, external?, disabled? } }
const PricingSection1 = ({
  tiers,
  eyebrow = "Our Pricing",
  title = "Find the perfect plan",
  subtitle,
  headingLevel = "h2",
}) => {
  const Heading = headingLevel;
  return (
    <section className="py-16" id="pricing">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <p className="text-muted-foreground mb-2 text-sm font-medium">
            {eyebrow}
          </p>
          <Heading className="text-3xl font-bold text-balance lg:text-5xl">
            {title}
          </Heading>
          {subtitle && (
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
              {subtitle}
            </p>
          )}
        </header>

        <div
          className={cn(
            "mx-auto grid gap-6 lg:gap-8",
            tiers.length === 2 ? "max-w-4xl md:grid-cols-2" : "lg:grid-cols-3",
          )}
        >
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn("flex flex-col overflow-hidden py-6", {
                "border-primary shadow-lg ring-1 ring-primary": tier.popular,
              })}
            >
              <CardHeader className="px-6">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-xl font-bold lg:text-2xl">
                    {tier.name}
                  </CardTitle>
                  {tier.popular ? (
                    <Badge className="px-2.5 py-0.5 font-semibold rounded-full">
                      Popular
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">
                  {tier.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 px-6">
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-3xl font-bold lg:text-5xl">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {tier.frequency}
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      ) : (
                        <Minus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className={cn("text-sm", feature.included ? "text-foreground" : "text-muted-foreground line-through decoration-1")}>
                        {feature.text}
                        {!feature.included && <span className="sr-only"> (not included)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="border-0 bg-transparent px-6 pb-6">
                {tier.cta.href && !tier.cta.disabled ? (
                  <Button
                    asChild
                    className="h-10 px-8 w-full cursor-pointer gap-2"
                    size="lg"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    <a
                      href={tier.cta.href}
                      {...(tier.cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      aria-label={`${tier.cta.label}: ${tier.name} plan`}
                    >
                      {tier.cta.label} <ArrowRight />
                    </a>
                  </Button>
                ) : (
                  <Button
                    className="h-10 px-8 w-full gap-2 disabled:opacity-100 text-muted-foreground"
                    size="lg"
                    variant="outline"
                    disabled
                  >
                    {tier.cta.label}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection1;
