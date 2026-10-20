import { BarChart3, Code2, Lightbulb, Palette } from "lucide-react";
import HeroSection from "@/components/ui/hero-01-utils/hero";
import Header from "@/components/ui/hero-01-utils/header";
import BrandSlider from "@/components/ui/hero-01-utils/brand-slider";

// The landing page's header, hero and role strip.
export default function AgencyHeroSection() {
  // The kinds of roles people practise for (no stock "user" photos).
  const avatarList = [
    { icon: Code2, label: "Engineering", tint: "#eeedfb" },
    { icon: BarChart3, label: "Data", tint: "#e6f4ec" },
    { icon: Lightbulb, label: "Product", tint: "#fdf3e1" },
    { icon: Palette, label: "Design", tint: "#fce8ef" },
  ];

  const navigationData = [
    { title: "Home", href: "/", isActive: true },
    { title: "How it works", href: "/how-it-works" },
    { title: "FAQ", href: "/faq" },
    { title: "Pricing", href: "/dashboard/upgrade" },
  ];

  // Roles you can practise for, shown as a moving strip.
  const brandList = [
    "Frontend developer", "Data analyst", "Product manager", "Backend engineer", "UX designer",
    "DevOps engineer", "Data scientist", "Mobile developer", "Engineering manager", "Business analyst",
    "QA engineer", "Sales executive", "Cloud architect", "Marketing manager",
  ].map((name) => ({ name }));

  return (
    // One screen, no scrolling on desktop; on short or narrow screens the
    // content may still scroll rather than be cut off.
    <div className="relative flex min-h-svh flex-col lg:h-svh lg:overflow-hidden">
      <Header navigationData={navigationData} />
      <main className="flex flex-1 flex-col">
        <HeroSection avatarList={avatarList} />
        <BrandSlider brandList={brandList} />
      </main>
    </div>
  );
}
