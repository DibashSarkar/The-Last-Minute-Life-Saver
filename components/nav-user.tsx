"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  IconSelector,
  IconSparkles,
  IconUser,
  IconCreditCard,
  IconBell,
  IconLogout,
} from "@tabler/icons-react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 transition-all"
              />
            }
          >
            <Avatar className="h-7 w-7 rounded-[var(--radius)] shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-[var(--radius)] bg-primary/10 text-primary text-[10px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
              <span className="truncate font-semibold text-sidebar-foreground">
                {user.name}
              </span>
              <span className="truncate text-[10px] text-sidebar-foreground/50">
                {user.email}
              </span>
            </div>
            <IconSelector className="ml-auto size-4 text-sidebar-foreground/40 shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-[var(--radius)]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-2 text-left">
                  <Avatar className="h-8 w-8 rounded-[var(--radius)] shrink-0">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-[var(--radius)] bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight min-w-0">
                    <span className="truncate text-xs font-semibold">{user.name}</span>
                    <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => window.location.href = "/pricing"}
                className="gap-2 text-xs cursor-pointer"
              >
                <IconSparkles className="size-3.5 text-primary" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => window.location.href = "/dashboard/settings"}
                className="gap-2 text-xs cursor-pointer"
              >
                <IconUser className="size-3.5 text-muted-foreground" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.location.href = "/pricing"}
                className="gap-2 text-xs cursor-pointer"
              >
                <IconCreditCard className="size-3.5 text-muted-foreground" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.location.href = "/dashboard/settings"}
                className="gap-2 text-xs cursor-pointer"
              >
                <IconBell className="size-3.5 text-muted-foreground" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={async () => {
                const { authLogout } = await import("@/lib/firebase");
                await authLogout();
                window.location.href = "/login";
              }}
              className="gap-2 text-xs cursor-pointer text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
            >
              <IconLogout className="size-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
