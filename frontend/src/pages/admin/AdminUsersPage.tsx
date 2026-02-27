import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

// API + types
import { api, type Page } from "@/api/api";
import type { PersonDto } from "@/api/types/Person";
import type { Role } from "@/api/types/Role";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// icons
import { Eye, Search, User2, RotateCcw, Loader2, Shield } from "lucide-react";

type SortKey = "personId" | "fullName" | "username";
type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

// If your Role enum has different values, adjust keys/labels accordingly.
const roleMeta: Record<string, { label: string; icon: React.ReactNode; badge: BadgeVariant }> = {
    ADMIN: { label: "Admin", icon: <Shield className="h-4 w-4" />, badge: "secondary" },
    USER: { label: "User", icon: <User2 className="h-4 w-4" />, badge: "outline" },
};

function FetchingBar({ show }: { show: boolean }) {
    if (!show) return null;
    return (
        <div className="mb-4">
            <div className="h-1 w-full overflow-hidden rounded bg-muted">
                <div className="h-full w-full bg-primary/40 animate-pulse" />
            </div>
        </div>
    );
}

function PersonSkeleton() {
    return (
        <div className="space-y-4 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border p-5 shadow-sm">
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-[280px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
            ))}
        </div>
    );
}

function UsersToolbar({
    query,
    setQuery,
    sortKey,
    setSortKey,
    rightSlot,
}: {
    query: string;
    setQuery: (v: string) => void;
    sortKey: SortKey;
    setSortKey: (v: SortKey) => void;
    rightSlot?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users… (current page)"
                    className="pl-10 h-10"
                />
            </div>

            <div className="flex items-center gap-3">
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                    <SelectTrigger className="w-[190px] h-10">
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="personId">Newest first</SelectItem>
                        <SelectItem value="fullName">Name (A–Z)</SelectItem>
                        <SelectItem value="username">Username (A–Z)</SelectItem>
                    </SelectContent>
                </Select>
                {rightSlot}
            </div>
        </div>
    );
}

function UserDetailsSheet({
    open,
    onOpenChange,
    person,
    isLoading,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    person: PersonDto | null;
    isLoading: boolean;
}) {
    if (!open) return null;

    const r = person ? roleMeta[String(person.role)] : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-6 sm:p-8 overflow-y-auto">
                {isLoading || !person ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-[80%]" />
                        <Skeleton className="h-5 w-[50%]" />
                        <Separator className="my-6" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <>
                        <SheetHeader className="space-y-3">
                            <SheetTitle className="leading-tight text-2xl">{person.fullName}</SheetTitle>
                            <div className="flex items-center gap-3 text-sm">
                                {r ? (
                                    <Badge variant={r.badge} className="gap-1.5 px-2.5 py-0.5 text-xs">
                                        {r.icon}
                                        {r.label}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="px-2.5 py-0.5 text-xs">
                                        {String(person.role)}
                                    </Badge>
                                )}
                                <span className="text-muted-foreground font-mono">#{person.personId}</span>
                            </div>
                        </SheetHeader>

                        <div className="mt-8 space-y-6">
                            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-muted-foreground">Username</div>
                                    <span className="font-mono bg-muted px-1.5 rounded">{person.username}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-muted-foreground">Role</div>
                                    <span className="font-mono bg-muted px-1.5 rounded">{String(person.role)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    System Metadata
                                </Label>
                                <div className="rounded-lg border bg-muted/10 p-4 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User2 className="h-4 w-4" />
                                            Person ID
                                        </div>
                                        <span className="font-mono bg-muted px-1.5 rounded">{person.personId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default function AdminUsersPage() {
    const [pageData, setPageData] = useState<Page<PersonDto> | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(0);

    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("personId");

    const [selected, setSelected] = useState<PersonDto | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const hasLoadedOnceRef = React.useRef(false);

    const loadUsers = useCallback(async () => {
        if (hasLoadedOnceRef.current) setIsFetching(true);
        else setIsInitialLoading(true);

        setError(null);

        try {
            const data = await api.persons.findAllPaginated(pageNumber);
            setPageData(data);
            hasLoadedOnceRef.current = true;
        } catch (err: any) {
            setError(err?.message || "Failed to load users.");
        } finally {
            setIsInitialLoading(false);
            setIsFetching(false);
        }
    }, [pageNumber]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const openDetails = useCallback(async (p: PersonDto) => {
        setSelected(p);
        setDetailsOpen(true);
        setDetailsLoading(true);
        try {
            const fresh = await api.persons.findById(p.personId);
            setSelected(fresh);
        } catch {
            /* ignore */
        } finally {
            setDetailsLoading(false);
        }
    }, []);

    const rows = useMemo(() => {
        const list = pageData?.content || [];
        const q = query.trim().toLowerCase();

        // Client-side filter (current page only)
        const filtered =
            q.length === 0
                ? list
                : list.filter((u) => {
                    return (
                        u.fullName?.toLowerCase().includes(q) ||
                        u.username?.toLowerCase().includes(q) ||
                        String(u.personId).includes(q) ||
                        String(u.role).toLowerCase().includes(q)
                    );
                });

        const sorted = [...filtered].sort((a, b) => {
            if (sortKey === "fullName") return a.fullName.localeCompare(b.fullName);
            if (sortKey === "username") return a.username.localeCompare(b.username);
            return b.personId - a.personId; // newest first
        });

        return sorted;
    }, [pageData, query, sortKey]);

    const handleReset = () => {
        setQuery("");
        setSortKey("personId");
        setPageNumber(0);
    };

    const currentPage = (pageData?.number ?? pageNumber) + 1;
    const totalPages = pageData?.totalPages ?? 1;
    const isLastPage = pageData?.last ?? true;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="mx-auto w-full max-w-6xl px-4 py-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Users</h1>
                    <p className="text-muted-foreground">Browse all registered users across the system.</p>
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                    <Card className="rounded-2xl border-border/60 bg-card/50 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <div className="mb-6">
                                <UsersToolbar
                                    query={query}
                                    setQuery={setQuery}
                                    sortKey={sortKey}
                                    setSortKey={setSortKey}
                                    rightSlot={
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleReset}>
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Reset Filters</TooltipContent>
                                        </Tooltip>
                                    }
                                />
                            </div>

                            <Separator className="mb-6" />

                            {error && (
                                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <FetchingBar show={isFetching && !!pageData} />

                            {isInitialLoading ? (
                                <PersonSkeleton />
                            ) : rows.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-14 text-center bg-muted/20">
                                    <div className="text-lg font-medium text-muted-foreground">No users matching your search</div>
                                </div>
                            ) : (
                                <div className="hidden md:block overflow-hidden rounded-xl border bg-card">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="py-4">User</TableHead>
                                                <TableHead className="py-4">Username</TableHead>
                                                <TableHead className="py-4">Role</TableHead>
                                                <TableHead className="py-4 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((u) => {
                                                const r = roleMeta[String(u.role)];
                                                return (
                                                    <TableRow
                                                        key={u.personId}
                                                        className="cursor-pointer hover:bg-accent/40 group"
                                                        onClick={() => openDetails(u)}
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="space-y-1">
                                                                <div className="font-semibold">{u.fullName}</div>
                                                                <div className="text-xs text-muted-foreground font-medium font-mono">
                                                                    #{u.personId}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                                                {u.username}
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            {r ? (
                                                                <Badge variant={r.badge} className="gap-1.5">
                                                                    {r.icon} {r.label}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline">{String(u.role)}</Badge>
                                                            )}
                                                        </TableCell>

                                                        <TableCell className="py-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openDetails(u);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            <Separator className="my-6" />

                            {/* ✅ Pagination shared by the paginated endpoint */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                                <div className="text-sm text-muted-foreground">
                                    {pageData ? (
                                        <>
                                            Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                                            <span className="font-medium text-foreground">{totalPages}</span> •{" "}
                                            <span className="font-medium text-foreground">{pageData.totalElements}</span> total
                                        </>
                                    ) : (
                                        "—"
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage <= 1 || isInitialLoading || isFetching}
                                        onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
                                    >
                                        {(isInitialLoading || isFetching) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Previous
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isLastPage || isInitialLoading || isFetching}
                                        onClick={() => setPageNumber((p) => p + 1)}
                                    >
                                        Next
                                        {(isInitialLoading || isFetching) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <UserDetailsSheet
                    open={detailsOpen}
                    onOpenChange={setDetailsOpen}
                    person={selected}
                    isLoading={detailsLoading}
                />
            </div>
        </TooltipProvider>
    );
}