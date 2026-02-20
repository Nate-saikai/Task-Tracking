import * as React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// shadcn/ui
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";

// icons
import { ListTodo, LogOut, Menu, Settings, Shield } from "lucide-react";

type Props = {
    title: string;
    basePath: "/admin" | "/app";
};

function initials(name?: string | null) {
    const n = (name ?? "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/);
    const a = parts[0]?.[0] ?? "U";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
}

export default function SidebarShell({ title, basePath }: Props) {
    const auth = useAuth();
    const navigate = useNavigate();
    const me = auth.user;

    async function handleLogout() {
        await auth.logout();
        navigate("/login", { replace: true });
    }

    const navItems = React.useMemo(
        () => [
            { to: `${basePath}/tasks`, label: "Tasks", icon: ListTodo },
            { to: `${basePath}/settings`, label: "Settings", icon: Settings },
        ],
        [basePath]
    );

    const Nav = ({ onNavigate }: { onNavigate?: () => void }) => (
        <nav className="grid gap-1">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            cn(
                                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-ring",
                                isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                            )
                        }
                    >
                        <Icon className="h-4 w-4 opacity-80 group-hover:opacity-100" />
                        <span>{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );

    const UserBlock = () => (
        <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">{initials(me?.fullName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
                <div className="truncate text-sm font-medium">{me?.fullName ?? "User"}</div>
                <div className="truncate text-xs text-muted-foreground">@{me?.username.toLowerCase() ?? "-"}</div>
                <div className="truncate text-xs text-muted-foreground">
                    {me?.role.toLowerCase() ?? "-"} • ID: {me?.personId ?? "-"}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-full bg-background overflow-hidden">
            <div className="flex h-full w-full overflow-hidden">
                {/* Desktop sidebar (no vertical scroll) */}
                <aside className="hidden w-72 border-r bg-card/40 md:block overflow-hidden">
                    <div className="flex h-full flex-col p-4 overflow-hidden">
                        {/* Brand */}
                        <div className="flex items-center gap-2 px-2 py-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="leading-tight">
                                <div className="text-sm font-semibold">{title}</div>
                                <div className="text-xs text-muted-foreground">Navigation</div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {/* No ScrollArea here if you want the sidebar never to scroll */}
                        <div className="flex-1">
                            <Nav />
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3">
                            <Card className="rounded-xl p-3 shadow-sm">
                                <UserBlock />
                            </Card>

                            <Button variant="outline" className="w-full" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main (ONLY this scrolls) */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
