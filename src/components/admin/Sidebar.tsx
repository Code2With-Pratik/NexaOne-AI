"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Activity, Settings, LogOut, ReceiptText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
    { label: "Overview", icon: LayoutDashboard, href: "/admin", color: "text-sky-500" },
    { label: "Users Management", icon: Users, href: "/admin/users", color: "text-violet-500" },
    { label: "Users Queries", icon: MessageSquare, href: "/admin/queries", color: "text-yellow-500" },
    { label: "Generation History", icon: Activity, href: "/admin/history", color: "text-pink-700" },
    { label: "Billing / Plans", icon: ReceiptText, href: "/admin/billing", color: "text-orange-700" },
    { label: "Settings", icon: Settings, href: "/admin/settings", color: "text-gray-500" },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-[95vh] bg-[#26242440] text-white w-full">
            <div className="px-3 py-2 flex-1">
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition whitespace-nowrap", // whitespace-nowrap prevents text breaking during close animation
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            
            <div className="px-3 py-4 border-t border-white/10">
                 <Link href="/dashboard" className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition text-zinc-400 whitespace-nowrap">
                    <LogOut className="h-5 w-5 mr-3" />
                    Exit Admin
                 </Link>
            </div>
        </div>
    );
};