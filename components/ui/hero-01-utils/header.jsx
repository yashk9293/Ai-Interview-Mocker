"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

// navigationData: [{ title, href, isActive? }]
export default function Header({ navigationData }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navigationData.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink asChild active={item.isActive}>
                  <Link
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-muted-foreground hover:text-foreground",
                      item.isActive && "text-primary hover:text-primary",
                    )}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/sign-up">Start free</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <Button asChild className="rounded-full px-5">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </Show>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                {navigationData.map((item) => (
                  <SheetClose asChild key={item.title}>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                        item.isActive && "bg-brand-tint text-primary",
                      )}
                    >
                      {item.title}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <Show when="signed-out">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="mt-6 w-full">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                </SheetClose>
              </Show>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
