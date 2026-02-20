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
        <nav className="grid gap-1 p-1">
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
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
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
                <div className="truncate text-xs text-muted-foreground">
                    {me?.role ?? "-"} • @{me?.username ?? "-"}
                </div>
                <div className="truncate text-xs text-muted-foreground">ID: {me?.personId ?? "-"}</div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <aside className="hidden w-72 border-r bg-card/40 md:block">
                <div className="flex h-full flex-col p-4">
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

                    <ScrollArea className="flex-1 pr-2">
                        <Nav />
                    </ScrollArea>

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

            <div className="flex flex-1 flex-col">
                <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
                    <div className="flex items-center justify-between px-4 py-3 md:px-6">
                        <div className="flex items-center gap-2">
                            <Sheet>
                                <SheetTrigger asChild className="md:hidden">
                                    <Button variant="outline" size="icon" aria-label="Open menu">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>

                                <SheetContent side="left" className="w-80 p-0 flex flex-col">
                                    <SheetHeader className="px-4 py-4">
                                        <SheetTitle className="text-base">{title}</SheetTitle>
                                    </SheetHeader>
                                    <Separator />
                                    <div className="flex flex-1 flex-col p-4 overflow-hidden">
                                        <ScrollArea className="flex-1 pr-2">
                                            <Nav />
                                        </ScrollArea>
                                        <Separator className="my-4" />
                                        <Card className="rounded-xl p-3 shadow-sm">
                                            <UserBlock />
                                        </Card>
                                        <Button variant="outline" className="mt-3 w-full" onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="text-sm font-semibold tracking-tight md:text-base">{title}</div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 gap-2 px-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="text-[10px]">{initials(me?.fullName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="hidden max-w-[160px] truncate text-sm md:inline">
                                        {me?.fullName ?? "User"}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-2">
                                    <div className="truncate text-sm font-medium">{me?.fullName ?? "User"}</div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        {me?.role ?? "-"} • @{me?.username ?? "-"}
                                    </div>
                                </div>
                                <Separator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
                    <Card className="min-h-full rounded-2xl border-border/60 shadow-sm">
                        <div className="p-4 sm:p-6">
                            <Outlet />
                        </div>
                    </Card>
                </main>
            </div>
        </div>
    );
}