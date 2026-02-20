import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";

// API + types
import { api, type Page } from "@/api/api";
import type { TaskDto } from "@/api/types/Task";
import type { Status } from "@/api/types/Status";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// icons
import { CheckCircle2, Circle, Clock3, Eye, Search, User2, RotateCcw, Loader2 } from "lucide-react";

type SortKey = "id" | "title";
type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const statusMeta: Record<Status, { label: string; icon: React.ReactNode; badge: BadgeVariant }> = {
    TO_DO: { label: "To do", icon: <Circle className="h-4 w-4" />, badge: "outline" },
    IN_PROGRESS: { label: "In progress", icon: <Clock3 className="h-4 w-4" />, badge: "secondary" },
    COMPLETED: { label: "Completed", icon: <CheckCircle2 className="h-4 w-4" />, badge: "secondary" },
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

function TaskSkeleton() {
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

function TaskToolbar({
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
                    placeholder="Search tasks…"
                    className="pl-10 h-10"
                />
            </div>

            <div className="flex items-center gap-3">
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                    <SelectTrigger className="w-[170px] h-10">
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="id">Newest first</SelectItem>
                        <SelectItem value="title">Title (A–Z)</SelectItem>
                    </SelectContent>
                </Select>
                {rightSlot}
            </div>
        </div>
    );
}

function TaskDetailsSheet({
    open,
    onOpenChange,
    task,
    isLoading,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    task: TaskDto | null;
    isLoading: boolean;
}) {
    if (!open) return null;
    const s = task ? statusMeta[task.trackingStatus as Status] : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-6 sm:p-8 overflow-y-auto">
                {isLoading || !task ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-[80%]" />
                        <Skeleton className="h-5 w-[50%]" />
                        <Separator className="my-6" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <>
                        <SheetHeader className="space-y-3">
                            <SheetTitle className="leading-tight text-2xl">{task.title}</SheetTitle>
                            <div className="flex items-center gap-3 text-sm">
                                {s && (
                                    <Badge variant={s.badge} className="gap-1.5 px-2.5 py-0.5 text-xs">
                                        {s.icon}
                                        {s.label}
                                    </Badge>
                                )}
                                <span className="text-muted-foreground font-mono">#{task.id}</span>
                            </div>
                        </SheetHeader>

                        <div className="mt-8 space-y-6">
                            <div className="bg-muted/30 rounded-lg p-4">
                                {task.description ? (
                                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-sm">{task.description}</p>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">No description provided.</p>
                                )}
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
                                            Owner
                                        </div>
                                        <span className="font-mono bg-muted px-1.5 rounded">{task.username}</span>
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

export default function AdminTasksPage() {
    const [pageData, setPageData] = useState<Page<TaskDto> | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(0);

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<Status | "ALL">("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("id");

    const [selected, setSelected] = useState<TaskDto | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const hasLoadedOnceRef = React.useRef(false);

    // Reset to page 0 whenever the "dataset" changes
    useEffect(() => {
        setPageNumber(0);
    }, [status, query]);

    const loadTasks = useCallback(async () => {
        if (hasLoadedOnceRef.current) setIsFetching(true);
        else setIsInitialLoading(true);

        setError(null);

        const q = query.trim();
        try {
            let data: Page<TaskDto>;

            const isSearching = q.length > 0;

            if (isSearching) {
                data =
                    status === "ALL"
                        ? await api.tasks.getAllByTitlePaginated(q, pageNumber)
                        : await api.tasks.getAllByTitleAndStatusPaginated(q, status, pageNumber);
            } else {
                data =
                    status === "ALL"
                        ? await api.tasks.getAllPaginated(pageNumber)
                        : await api.tasks.getByStatusPaginated(status, pageNumber);
            }

            setPageData(data);
            hasLoadedOnceRef.current = true;
        } catch (err: any) {
            setError(err.message || "Failed to load tasks.");
        } finally {
            setIsInitialLoading(false);
            setIsFetching(false);
        }
    }, [pageNumber, status, query]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const openDetails = useCallback(async (t: TaskDto) => {
        setSelected(t);
        setDetailsOpen(true);
        setDetailsLoading(true);
        try {
            const fresh = await api.tasks.getById(t.id);
            setSelected(fresh);
        } catch {
            /* ignore */
        } finally {
            setDetailsLoading(false);
        }
    }, []);

    const rows = useMemo(() => {
        const list = pageData?.content || [];
        const sorted = [...list].sort((a, b) => {
            if (sortKey === "title") return a.title.localeCompare(b.title);
            return b.id - a.id; // newest first
        });
        return sorted;
    }, [pageData, sortKey]);

    const handleReset = () => {
        setQuery("");
        setStatus("ALL");
        setSortKey("id");
        setPageNumber(0);
    };

    const currentPage = (pageData?.number ?? pageNumber) + 1;
    const totalPages = pageData?.totalPages ?? 1;
    const isLastPage = pageData?.last ?? true;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="mx-auto w-full max-w-6xl px-4 py-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Tasks</h1>
                    <p className="text-muted-foreground">Monitoring user tasks across the entire system.</p>
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                    <Card className="rounded-2xl border-border/60 bg-card/50 shadow-sm overflow-hidden">
                        {/* Tab Header Segment */}
                        <div className="border-b border-border/60 bg-muted/10">
                            <div className="p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold">Global Registry</div>
                                    <div className="text-xs text-muted-foreground">Filter system tasks by status</div>
                                </div>

                                <Tabs value={status} onValueChange={(v) => setStatus(v as any)} className="w-full sm:w-fit">
                                    <TabsList className="w-full sm:w-fit h-11 px-1">
                                        <TabsTrigger value="ALL" className="min-w-[72px] h-9">
                                            All
                                        </TabsTrigger>
                                        <TabsTrigger value="TO_DO" className="h-9 px-4">
                                            To do
                                        </TabsTrigger>
                                        <TabsTrigger value="IN_PROGRESS" className="h-9 px-4">
                                            In progress
                                        </TabsTrigger>
                                        <TabsTrigger value="COMPLETED" className="h-9 px-4">
                                            Completed
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="mb-6">
                                <TaskToolbar
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
                                <TaskSkeleton />
                            ) : rows.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-14 text-center bg-muted/20">
                                    <div className="text-lg font-medium text-muted-foreground">No tasks matching your filters</div>
                                </div>
                            ) : (
                                <div className="hidden md:block overflow-hidden rounded-xl border bg-card">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="py-4">Task</TableHead>
                                                <TableHead className="py-4">Owner</TableHead>
                                                <TableHead className="py-4">Status</TableHead>
                                                <TableHead className="py-4 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((t) => {
                                                const s = statusMeta[t.trackingStatus as Status];
                                                return (
                                                    <TableRow
                                                        key={t.id}
                                                        className="cursor-pointer hover:bg-accent/40 group"
                                                        onClick={() => openDetails(t)}
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="space-y-1">
                                                                <div className="font-semibold">{t.title}</div>
                                                                <div className="text-xs text-muted-foreground font-medium font-mono">#{t.id}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                                                {t.username}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant={s.badge} className="gap-1.5">
                                                                {s.icon} {s.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openDetails(t);
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

                            {/* Mobile list view logic could go here, matching UserTasksPage cards */}

                            <Separator className="my-6" />

                            {/* ✅ Single pagination UI shared by ALL paginated endpoints (all / status / search) */}
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

                <TaskDetailsSheet
                    open={detailsOpen}
                    onOpenChange={setDetailsOpen}
                    task={selected}
                    isLoading={detailsLoading}
                />
            </div>
        </TooltipProvider>
    );
}