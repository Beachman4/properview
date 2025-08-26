"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Building, MessageSquare, User, LogOut } from "lucide-react";
import { useContext } from "react";
import { toast } from "sonner";
import { AgentAuthContext } from "@/providers/agent-auth.provider";
import Providers from "@/providers/Providers";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AgentAuthProvider } from "@/providers/agent-auth.provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "../globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { CookiesProvider } from "react-cookie";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userData, logout } = useContext(AgentAuthContext);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const navigation = [
    {
      title: "Properties",
      href: "/agent/properties",
      icon: Building,
      isActive: pathname.startsWith("/agent/properties"),
    },
    {
      title: "Inquiries",
      href: "/agent/inquiries",
      icon: MessageSquare,
      isActive: pathname.startsWith("/agent/inquiries"),
    },
  ];

  // If on login page, don't show sidebar
  if (pathname === "/agent/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Building className="h-6 w-6" />
              <span className="font-semibold text-lg">Agent Portal</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {userData?.name || "Agent"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userData?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-6 w-px bg-border mx-2" />
            <h1 className="font-semibold">Agent Portal</h1>
          </header>

          {/* Page content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <CookiesProvider defaultSetOptions={{ path: "/" }}>
            <AgentAuthProvider>
              <AgentDashboardLayout>{children}</AgentDashboardLayout>
            </AgentAuthProvider>
          </CookiesProvider>
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  );
}
