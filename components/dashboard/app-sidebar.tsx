"use client";

import * as React from "react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { FileChartLineIcon, BookOpenIcon, LogOutIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Allgemein",
      items: [
        {
          title: "Statistiken",
          url: "/dashboard",
          icon: FileChartLineIcon,
        },
        {
          title: "Anträge",
          url: "/dashboard/antraege",
          icon: BookOpenIcon,
        },
      ],
    },
  ],
};

function SidebarLogo() {
  return (
    <Image
      src="/assets/logo_datagvat.png"
      alt="IFG Agent"
      width={32}
      height={32}
    />
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-16 max-md:mt-2 mb-2 justify-center">
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="-mt-2">
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/65">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button group-data-[collapsible=icon]:px-[5px]! font-medium gap-3 h-9 [&>svg]:size-auto"
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <a href={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" className="w-full gap-2">
          <LogOutIcon size={16} />
          <span>Abmelden</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
