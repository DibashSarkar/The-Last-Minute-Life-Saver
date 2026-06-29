"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { NavUser } from "@/components/nav-user";
import { getNotifications } from "@/lib/notifications";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getCurrentUser, UserProfile } from "@/lib/firebase";
import {
  IconBolt,
  IconLayoutDashboard,
  IconHourglass,
  IconChartBar,
  IconHistory,
  IconSettings,
  IconBrain,
  IconChevronRight,
  IconActivity,
  IconCalendar,
  IconListCheck,
  IconTarget,
  IconMoodSmile,
  IconReport,
  IconHeart,
  IconShieldLock,
  IconBell,
} from "@tabler/icons-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const list = getNotifications();
      setUnreadCount(list.filter(n => !n.read).length);
    };
    updateCount();
    window.addEventListener("lifesaver_notification_update", updateCount);
    return () => window.removeEventListener("lifesaver_notification_update", updateCount);
  }, []);

  const [activeUser, setActiveUser] = useState<UserProfile & { isAdmin?: boolean }>({
    uid: "guest",
    email: "guest@lifesaver.ai",
    displayName: "Workspace Owner",
    createdAt: new Date().toISOString(),
    onboarded: true,
    isAdmin: false,
  });

  useEffect(() => {
    async function load() {
      const u = await getCurrentUser();
      if (u) {
        // Set admin permissions dynamically for testing
        const isAdmin = u.email === "admin@lifesaver.ai" || u.email?.includes("admin");
        setActiveUser({ ...u, isAdmin });
      }
    }
    load();
  }, []);

  const user = {
    name: activeUser.displayName || activeUser.email.split("@")[0],
    email: activeUser.email,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser.email}`,
  };

  const dashboardSubmenus = [
    { title: "Overview", tab: "overview", icon: IconLayoutDashboard },
    { title: "Tasks", tab: "tasks", icon: IconListCheck },
    { title: "Habits", tab: "habits", icon: IconActivity },
    { title: "Goals", tab: "goals", icon: IconTarget },
    { title: "Mood", tab: "mood", icon: IconMoodSmile },
    { title: "Mental Health", tab: "mental_health", icon: IconHeart },
    { title: "Progress", tab: "progress", icon: IconChartBar },
    { title: "Reports", tab: "reports", icon: IconReport },
    { title: "Calendar", tab: "calendar", icon: IconCalendar },
    { title: "Insights", tab: "insights", icon: IconBrain },
    { title: "Settings", tab: "settings", icon: IconSettings },
  ];

  const secondaryNavItems = [
    {
      title: "Inbox Alerts",
      url: "/dashboard?tab=notifications",
      icon: IconBell,
      tab: "notifications",
    },
    {
      title: "Health Companion",
      url: "/dashboard?tab=health",
      icon: IconHeart,
      tab: "health",
    },
    {
      title: "Workspace",
      url: "/dashboard/workspace",
      icon: IconBrain,
    },
    {
      title: "Focus Room",
      url: "/dashboard/focus",
      icon: IconHourglass,
    },
    {
      title: "Saved History",
      url: "/dashboard/history",
      icon: IconHistory,
    },
    {
      title: "Preferences",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ];

  const isDashboardActive = pathname === "/dashboard";

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      {/* Header – Brand Logo */}
      <SidebarHeader className="py-3 px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              className="hover:bg-sidebar-accent/60 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground shadow-sm shrink-0">
                <IconBolt className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-semibold text-xs tracking-tight text-sidebar-foreground truncate">
                  Life Saver
                </span>
                <span className="text-[9px] text-sidebar-foreground/50 font-bold uppercase tracking-wider truncate">
                  Task Companion
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 !w-auto" />

      {/* Main Navigation */}
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold tracking-widest uppercase text-sidebar-foreground/40 px-2 mb-1">
            Navigation
          </SidebarGroupLabel>
          
          <SidebarMenu>
            {/* Dashboard Collapsible - open by default */}
            <Collapsible
              defaultOpen={true}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    isActive={isDashboardActive}
                    tooltip="Dashboard"
                    className={[
                      "group/nav-item relative gap-2.5 font-semibold transition-all duration-150",
                      isDashboardActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    ].join(" ")}
                  />
                }
              >
                <IconLayoutDashboard
                  className={[
                    "h-4 w-4 shrink-0 transition-colors duration-150 text-primary", // Blue color for menu icons
                  ].join(" ")}
                />
                <span className="text-xs">Dashboard</span>
                <IconChevronRight className="ml-auto h-3.5 w-3.5 text-sidebar-foreground/30 transition-transform duration-200 group-data-open/collapsible:rotate-90 shrink-0" />
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <SidebarMenuSub className="ml-3.5 border-l border-sidebar-border/50 pl-2.5 py-1 gap-1 flex flex-col">
                  {dashboardSubmenus.map((sub) => {
                    const isSubActive = isDashboardActive && currentTab === sub.tab;
                    const SubIcon = sub.icon;
                    return (
                      <SidebarMenuSubItem key={sub.tab}>
                        <SidebarMenuSubButton
                          render={<Link href={`/dashboard?tab=${sub.tab}`} />}
                          isActive={isSubActive}
                          className={[
                            "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 w-full",
                            isSubActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <SubIcon
                              className={[
                                "h-3.5 w-3.5 shrink-0 transition-colors text-orange-500", // Orange color for submenu icons
                              ].join(" ")}
                            />
                            <span className="truncate">{sub.title}</span>
                          </div>
                          {sub.tab === "notifications" && unreadCount > 0 && (
                            <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                              {unreadCount}
                            </span>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>

            {/* Other Secondary Pages */}
            {secondaryNavItems.map((item) => {
              const isActive = item.tab 
                ? (pathname === "/dashboard" && currentTab === item.tab)
                : (pathname === item.url || pathname.startsWith(item.url + "/"));
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive}
                    size="sm"
                    tooltip={item.title}
                    className={[
                      "group/nav-item relative gap-2.5 font-semibold transition-all duration-150 w-full flex items-center justify-between",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={[
                          "h-4 w-4 shrink-0 transition-colors duration-150 text-primary", // Blue color for secondary icons
                        ].join(" ")}
                      />
                      <span className="text-xs truncate">{item.title}</span>
                    </div>
                    {item.tab === "notifications" && unreadCount > 0 && (
                      <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 shimmer-glow">
                        {unreadCount}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            {/* Admin Area - Conditional */}
            {activeUser.isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/admin" />}
                  isActive={pathname.startsWith("/admin")}
                  size="sm"
                  tooltip="Admin Panel"
                  className={[
                    "group/nav-item relative gap-2.5 font-semibold transition-all duration-150 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10",
                  ].join(" ")}
                >
                  <IconShieldLock className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs">Admin Control</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-3 !w-auto" />

      {/* Footer – User */}
      <SidebarFooter className="py-2 px-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
