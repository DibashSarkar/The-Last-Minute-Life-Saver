"use client";

import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { IconChevronRight } from "@tabler/icons-react";

export function NavMain({
  items,
  label,
}: {
  label?: string;
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/40 px-2 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            item.url === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.url || pathname.startsWith(item.url + "/");
          const Icon = item.icon;

          if (!item.items || item.items.length === 0) {
            // Flat nav item
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<a href={item.url} />}
                  isActive={isActive}
                  size="sm"
                  tooltip={item.title}
                  className={[
                    "group/nav-item relative gap-2.5 font-medium transition-all duration-150",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  ].join(" ")}
                >
                  {Icon && (
                    <Icon
                      className={[
                        "h-4 w-4 shrink-0 transition-colors duration-150",
                        isActive
                          ? "text-sidebar-accent-foreground"
                          : "text-zinc-400 group-hover/nav-item:text-sidebar-foreground dark:text-zinc-500 dark:group-hover/nav-item:text-zinc-300",
                      ].join(" ")}
                    />
                  )}
                  <span className="text-xs">{item.title}</span>
                  {isActive && (
                    <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-sidebar-accent-foreground opacity-70" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // Collapsible group item
          return (
            <Collapsible
              key={item.title}
              defaultOpen={item.isActive || isActive}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    tooltip={item.title}
                    size="sm"
                    isActive={isActive}
                    className={[
                      "group/nav-item relative gap-2.5 font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    ].join(" ")}
                  />
                }
              >
                {Icon && (
                  <Icon
                    className={[
                      "h-4 w-4 shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-zinc-400 group-hover/nav-item:text-sidebar-foreground dark:text-zinc-500",
                    ].join(" ")}
                  />
                )}
                <span className="text-xs">{item.title}</span>
                <IconChevronRight className="ml-auto h-3.5 w-3.5 text-sidebar-foreground/30 transition-transform duration-200 group-data-open/collapsible:rotate-90 shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="ml-3 border-l-sidebar-border/50">
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        render={<a href={subItem.url} />}
                        isActive={pathname === subItem.url}
                        className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
