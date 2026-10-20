"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

function Avatar({ user, size = 32 }) {
  const initials = (user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "?")
    .split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return user?.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.imageUrl} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-semibold text-brand" style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}

const itemClass =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] text-ink outline-none transition-colors data-[highlighted]:bg-raised";

// The account row at the foot of the sidebar (or the avatar in the phone top
// bar). The whole row opens the menu, not just the picture.
export default function AccountMenu({ variant = "row" }) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  if (!isLoaded || !user) return <div className={variant === "row" ? "h-11" : "size-8"} />;

  const name = user.fullName || user.firstName || "Your account";
  const email = user.primaryEmailAddress?.emailAddress;
  const compact = variant !== "row";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "flex items-center gap-2.5 rounded-lg text-left outline-none transition-colors hover:bg-raised focus-visible:ring-2 focus-visible:ring-brand/40 data-[state=open]:bg-raised",
          compact ? "p-1" : "w-full px-2 py-1.5",
        )}
        aria-label={`Account menu for ${name}`}
      >
        <Avatar user={user} size={compact ? 30 : 32} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">{name}</span>
              <span className="block truncate text-[12px] text-faint">{email}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-faint" aria-hidden="true" />
          </>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={variant === "row" ? "top" : variant === "rail" ? "right" : "bottom"}
          align={variant === "bar" ? "end" : "start"}
          sideOffset={8}
          collisionPadding={12}
          className="z-50 w-64 rounded-xl border border-line bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(17,24,39,0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <div className="flex items-center gap-3 rounded-lg bg-surface px-2.5 py-3">
            <Avatar user={user} size={40} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{name}</p>
              <p className="truncate text-[12px] text-muted-foreground">{email}</p>
              <p className="mt-1 inline-flex rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand">Free plan</p>
            </div>
          </div>

          <div className="mt-1.5 flex flex-col">
            <DropdownMenu.Item className={itemClass} onSelect={() => openUserProfile()}>
              <UserCog className="size-4 text-faint" aria-hidden="true" /> Manage account
            </DropdownMenu.Item>
          </div>

          <DropdownMenu.Separator className="my-1.5 h-px bg-line" />
          <DropdownMenu.Item
            className={cn(itemClass, "text-negative data-[highlighted]:bg-negative-tint")}
            onSelect={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
