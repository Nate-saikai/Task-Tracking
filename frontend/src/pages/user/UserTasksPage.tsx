import * as React from "react";
import { useCallback, useMemo, useState } from "react";

// API + types (adjust import paths if yours differ)
import { api, type Page } from "@/api/api";
import type { CreateTaskDto, TaskDto } from "@/api/types/Task";
import type { PersonDto } from "@/api/types/Person";
import type { Status } from "@/api/types/Status";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// icons
import { CheckCircle2, Circle, Clock3, Pencil, Plus, Search, Trash2, ArrowLeft, ArrowRight } from "lucide-react";

type TaskStatus = Status;
type ViewMode = "MY" | "ALL";
type SortKey = "recent" | "title";

const statusMeta: Record<
    TaskStatus,
    { label: string; icon: React.ReactNode; badge: "secondary" | "secondary" | "destructive" | "outline" }
> = {
    TO_DO: { label: "To do", icon: <Circle className="h-4 w-4" />, badge: "outline" },
    IN_PROGRESS: { label: "In progress", icon: <Clock3 className="h-4 w-4" />, badge: "secondary" },
    COMPLETED: { label: "Completed", icon: <CheckCircle2 className="h-4 w-4" />, badge: "secondary" },
};

function sortTasks(tasks: TaskDto[], sortKey: SortKey) {
    const copy = [...tasks];
    copy.sort((a, b) => {
        if (sortKey === "title") return (a.title ?? "").localeCompare(b.title ?? "");
        // "recent": best we have is id descending
        return (b.id ?? 0) - (a.id ?? 0);
    });
    return copy;
}

function getNextStatus(status: TaskStatus): TaskStatus | null {
    if (status === "TO_DO") return "IN_PROGRESS";
    if (status === "IN_PROGRESS") return "COMPLETED";
    return null;
}

function getPrevStatus(status: TaskStatus): TaskStatus | null {
    if (status === "COMPLETED") return "IN_PROGRESS";
    if (status === "IN_PROGRESS") return "TO_DO";
    return null;
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

function EmptyState({ title, hint }: { title: string; hint?: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-14 text-center bg-muted/20">
            <div className="text-lg font-medium">{title}</div>
            {hint && <div className="mt-2 text-sm text-muted-foreground">{hint}</div>}
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{message}</div>;
}

function TaskToolbar({
    query,
    setQuery,
    status,
    setStatus,
    sortKey,
    setSortKey,
    viewMode,
    setViewMode,
    canViewAll,
    rightSlot,
}: {
    query: string;
    setQuery: (v: string) => void;
    status: TaskStatus | "ALL";
    setStatus: (v: TaskStatus | "ALL") => void;
    sortKey: SortKey;
    setSortKey: (v: SortKey) => void;
    viewMode: ViewMode;
    setViewMode: (v: ViewMode) => void;
    canViewAll: boolean;
    rightSlot?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks…" className="pl-10 h-10" />
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {canViewAll && (
                        <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                            <SelectTrigger className="w-[170px] h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MY">My tasks</SelectItem>
                                <SelectItem value="ALL">All tasks (admin)</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                        <SelectTrigger className="w-[170px] h-10">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Newest first</SelectItem>
                            <SelectItem value="title">Title (A–Z)</SelectItem>
                        </SelectContent>
                    </Select>

                    {rightSlot}
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <Tabs value={status} onValueChange={(v) => setStatus(v as any)} className="w-full">
                    <TabsList className="w-full justify-start h-11 px-1">
                        <TabsTrigger value="ALL" className="min-w-[72px] h-9">
                            All
                        </TabsTrigger>
                        <TabsTrigger value="TO_DO" className="h-9 px-4">To do</TabsTrigger>
                        <TabsTrigger value="IN_PROGRESS" className="h-9 px-4">In progress</TabsTrigger>
                        <TabsTrigger value="COMPLETED" className="h-9 px-4">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex flex-wrap items-center gap-2 md:hidden">
                    {canViewAll && (
                        <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                            <SelectTrigger className="w-[150px] h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MY">My tasks</SelectItem>
                                <SelectItem value="ALL">All (admin)</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                        <SelectTrigger className="w-[150px] h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Newest</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                        </SelectContent>
                    </Select>

                    {rightSlot}
                </div>
            </div>
        </div>
    );
}

function TaskFormSheet({
    open,
    onOpenChange,
    mode,
    initial,
    onSubmit,
    isSaving,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    mode: "create" | "edit";
    initial?: TaskDto | null;
    onSubmit: (dto: CreateTaskDto) => Promise<void>;
    isSaving: boolean;
}) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [trackingStatus, setTrackingStatus] = useState<TaskStatus>((initial?.trackingStatus as TaskStatus) ?? "TO_DO");
    const [localError, setLocalError] = useState<string | null>(null);

    React.useEffect(() => {
        if (!open) return;
        setTitle(initial?.title ?? "");
        setDescription(initial?.description ?? "");
        setTrackingStatus(((initial?.trackingStatus as TaskStatus) ?? "TO_DO") as TaskStatus);
        setLocalError(null);
    }, [open, initial]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-6 sm:p-8 overflow-y-auto">
                <SheetHeader className="space-y-2">
                    <SheetTitle className="text-2xl">{mode === "create" ? "Create task" : "Edit task"}</SheetTitle>
                    <SheetDescription className="text-base">
                        {mode === "create" ? "Add a new task to your list. It will be marked as 'To do'." : "Update the task details."}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                    {localError && <ErrorState message={localError} />}

                    <div className="space-y-3">
                        <Label htmlFor="task-title" className="text-sm font-medium">Title</Label>
                        <Input
                            id="task-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Finish sprint review notes"
                            disabled={isSaving}
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="task-desc" className="text-sm font-medium">Description</Label>
                        <Textarea
                            id="task-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional details…"
                            className="min-h-[140px] resize-y p-3"
                            disabled={isSaving}
                        />
                    </div>

                    {mode === "edit" && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Status</Label>
                            <Select value={trackingStatus} onValueChange={(v) => setTrackingStatus(v as TaskStatus)} disabled={isSaving}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TO_DO">To do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Separator className="my-6" />

                    <div className="flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            className="h-9 px-4" onClick={() => onOpenChange(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            className="h-9 px-4"
                            onClick={async () => {
                                setLocalError(null);
                                const trimmed = title.trim();
                                if (!trimmed) {
                                    setLocalError("Title is required.");
                                    return;
                                }
                                await onSubmit({
                                    title: trimmed,
                                    description: description?.trim() ? description.trim() : undefined,
                                    trackingStatus: mode === "create" ? "TO_DO" : trackingStatus,
                                });
                            }}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving…" : mode === "create" ? "Create Task" : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function TaskDetailsSheet({
    open,
    onOpenChange,
    task,
    onUpdateStatus,
    onEdit,
    onDelete,
    isLoading,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    task: TaskDto | null;
    onUpdateStatus?: (taskId: number, status: TaskStatus) => Promise<void> | void;
    onEdit?: (t: TaskDto) => void;
    onDelete?: (t: TaskDto) => void;
    isLoading?: boolean;
}) {
    if (!open) return null;

    const s = task ? statusMeta[task.trackingStatus as TaskStatus] : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-6 sm:p-8 overflow-y-auto">
                {isLoading || !task ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-[80%]" />
                        <Skeleton className="h-5 w-[50%]" />
                        <Separator className="my-6" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-12 w-full mt-6" />
                    </div>
                ) : (
                    <>
                        <SheetHeader className="space-y-3">
                            <SheetTitle className="leading-tight text-2xl">{task.title}</SheetTitle>
                            <SheetDescription className="flex items-center gap-3 text-sm">
                                {s && (
                                    <Badge variant={s.badge} className="gap-1.5 px-2.5 py-0.5 text-xs">
                                        {s.icon}
                                        {s.label}
                                    </Badge>
                                )}
                                <span className="text-muted-foreground">Task #{task.id}</span>
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-8 space-y-6">
                            <div className="bg-muted/30 rounded-lg p-4">
                                {task.description ? (
                                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-sm">
                                        {task.description}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">No description provided.</p>
                                )}
                            </div>

                            <Separator />

                            {onUpdateStatus && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Move Status</Label>
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-11"
                                            disabled={task.trackingStatus === "TO_DO"}
                                            onClick={() => {
                                                const prev = getPrevStatus(task.trackingStatus as TaskStatus);
                                                if (prev) onUpdateStatus(task.id, prev);
                                            }}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-11"
                                            disabled={task.trackingStatus === "COMPLETED"}
                                            onClick={() => {
                                                const next = getNextStatus(task.trackingStatus as TaskStatus);
                                                if (next) onUpdateStatus(task.id, next);
                                            }}
                                        >
                                            Next <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {(onEdit || onDelete) && (
                                <>
                                    <Separator className="my-2" />
                                    <div className="flex items-center justify-end gap-3">
                                        {onDelete && (
                                            <Button
                                                variant="destructive"
                                                className="gap-2 h-10"
                                                onClick={() => onDelete(task)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        )}
                                        {onEdit && (
                                            <Button
                                                variant="outline"
                                                className="h-9 px-4" onClick={() => onEdit(task)}>
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function TaskList({
    tasks,
    onOpenTask,
    onEdit,
    onDelete,
    onUpdateStatus,
}: {
    tasks: TaskDto[];
    onOpenTask: (t: TaskDto) => void;
    onEdit: (t: TaskDto) => void;
    onDelete: (t: TaskDto) => void;
    onUpdateStatus: (taskId: number, status: TaskStatus) => void;
}) {
    return (
        <div className="space-y-4">
            {/* Mobile cards */}
            <div className="grid gap-4 md:hidden">
                {tasks.map((t) => {
                    const s = statusMeta[t.trackingStatus as TaskStatus];
                    return (
                        <div
                            key={t.id}
                            className="w-full rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md"
                        >
                            <button
                                onClick={() => onOpenTask(t)}
                                className="w-full text-left focus:outline-none mb-4"
                            >
                                <div className="min-w-0">
                                    <div className="truncate font-semibold text-lg">{t.title}</div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant={s.badge} className="gap-1.5 px-2 py-0.5">
                                            {s.icon}
                                            {s.label}
                                        </Badge>
                                        <span>#{t.id}</span>
                                    </div>
                                    <div className="mt-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                                        {t.description || "No description"}
                                    </div>
                                </div>
                            </button>

                            <Separator className="mb-4" />

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        disabled={t.trackingStatus === "TO_DO"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const prev = getPrevStatus(t.trackingStatus as TaskStatus);
                                            if (prev) onUpdateStatus(t.id, prev);
                                        }}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        disabled={t.trackingStatus === "COMPLETED"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const next = getNextStatus(t.trackingStatus as TaskStatus);
                                            if (next) onUpdateStatus(t.id, next);
                                        }}
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" className="gap-2 h-8" onClick={() => onEdit(t)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(t)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-[35%] py-4">Task</TableHead>
                            <TableHead className="w-[15%] py-4">Status</TableHead>
                            <TableHead className="w-[30%] py-4">Description</TableHead>
                            <TableHead className="w-[20%] py-4 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {tasks.map((t) => {
                            const s = statusMeta[t.trackingStatus as TaskStatus];
                            return (
                                <TableRow key={t.id} className="cursor-pointer transition-colors hover:bg-accent/40 group" onClick={() => onOpenTask(t)}>
                                    <TableCell className="py-4">
                                        <div className="space-y-1.5">
                                            <div className="font-semibold text-base leading-tight">{t.title}</div>
                                            <div className="text-xs text-muted-foreground font-medium">#{t.id}</div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="py-4">
                                        <Badge variant={s.badge} className="gap-1.5 px-2.5 py-1">
                                            {s.icon}
                                            {s.label}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="py-4 text-sm text-muted-foreground">
                                        <div className="truncate max-w-[320px] leading-relaxed">{t.description || "No description"}</div>
                                    </TableCell>

                                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-1 mr-2 border-r pr-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={t.trackingStatus === "TO_DO"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const prev = getPrevStatus(t.trackingStatus as TaskStatus);
                                                        if (prev) onUpdateStatus(t.id, prev);
                                                    }}
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={t.trackingStatus === "COMPLETED"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const next = getNextStatus(t.trackingStatus as TaskStatus);
                                                        if (next) onUpdateStatus(t.id, next);
                                                    }}
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(t)} aria-label="Edit">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(t)} aria-label="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default function UserTasksPage() {
    const [me, setMe] = useState<PersonDto | null>(null);
    const canViewAll = me?.role === "ADMIN";

    const [viewMode, setViewMode] = useState<ViewMode>("MY");

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("recent");

    const [pageNumber, setPageNumber] = useState(0);
    const [pageData, setPageData] = useState<Page<TaskDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selected, setSelected] = useState<TaskDto | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [formInitial, setFormInitial] = useState<TaskDto | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load current user (for admin-only "ALL" endpoints)
    React.useEffect(() => {
        let mounted = true;
        api.auth
            .me()
            .then((u) => {
                if (!mounted) return;
                setMe(u);
            })
            .catch(() => {
                // ignore; page still works in "MY" mode if session is present server-side
                setMe(null);
            });
        return () => {
            mounted = false;
        };
    }, []);

    // If user isn't admin, force MY
    React.useEffect(() => {
        if (!canViewAll && viewMode === "ALL") setViewMode("MY");
    }, [canViewAll, viewMode]);

    const loadPage = useCallback(
        async (nextPageNumber: number, nextStatus: TaskStatus | "ALL", nextViewMode: ViewMode) => {
            setIsLoading(true);
            setError(null);
            try {
                const data: Page<TaskDto> =
                    nextViewMode === "ALL"
                        ? nextStatus === "ALL"
                            ? await api.tasks.getAllPaginated(nextPageNumber)
                            : await api.tasks.getByStatusPaginated(nextStatus, nextPageNumber)
                        : nextStatus === "ALL"
                            ? await api.tasks.getMyTasksPaginated(nextPageNumber)
                            : await api.tasks.getMyTasksByStatusPaginated(nextPageNumber, nextStatus);

                setPageData(data);
            } catch (e: any) {
                setError(e?.message ?? "Failed to load tasks.");
                setPageData(null);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Reload on view/status/page changes
    React.useEffect(() => {
        loadPage(pageNumber, status, viewMode);
    }, [loadPage, pageNumber, status, viewMode]);

    // Reset pagination when switching status/view
    React.useEffect(() => {
        setPageNumber(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, viewMode]);

    const serverTasks = pageData?.content ?? [];

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = serverTasks;

        if (q) {
            list = list.filter((t) => (`${t.title} ${t.description ?? ""}`).toLowerCase().includes(q));
        }

        return sortTasks(list, sortKey);
    }, [serverTasks, query, sortKey]);

    const refresh = useCallback(async () => {
        await loadPage(pageNumber, status, viewMode);
    }, [loadPage, pageNumber, status, viewMode]);

    const openDetails = useCallback(
        async (t: TaskDto) => {
            setSelected(t);
            setDetailsOpen(true);

            // include controller functionality: getById
            setDetailsLoading(true);
            try {
                const fresh = await api.tasks.getById(t.id);
                setSelected(fresh);
            } catch {
                // keep existing selection if fetch fails
            } finally {
                setDetailsLoading(false);
            }
        },
        []
    );

    const handleCreate = useCallback(
        async (dto: CreateTaskDto) => {
            setIsSaving(true);
            try {
                await api.tasks.create(dto);
                setFormOpen(false);
                setFormInitial(null);
                setFormMode("create");
                // reload (page might change if it was empty)
                await refresh();
            } finally {
                setIsSaving(false);
            }
        },
        [refresh]
    );

    const handleUpdate = useCallback(
        async (taskId: number, dto: CreateTaskDto) => {
            setIsSaving(true);
            try {
                await api.tasks.update(taskId, dto);
                setFormOpen(false);
                setFormInitial(null);
                setFormMode("create");
                await refresh();

                // update selected if it's the same task
                if (selected?.id === taskId) {
                    try {
                        const fresh = await api.tasks.getById(taskId);
                        setSelected(fresh);
                    } catch {
                        // ignore
                    }
                }
            } finally {
                setIsSaving(false);
            }
        },
        [refresh, selected]
    );

    const handleDelete = useCallback(
        async (t: TaskDto) => {
            const ok = window.confirm(`Delete "${t.title}"? This cannot be undone.`);
            if (!ok) return;

            setIsSaving(true);
            try {
                await api.tasks.delete(t.id);

                if (selected?.id === t.id) {
                    setDetailsOpen(false);
                    setSelected(null);
                }

                // reload and handle "deleted last item on page"
                await loadPage(pageNumber, status, viewMode);

                const after = pageData?.content?.length ?? 0;
                if (after <= 1 && pageNumber > 0) {
                    setPageNumber((p) => Math.max(0, p - 1));
                }
            } finally {
                setIsSaving(false);
            }
        },
        [loadPage, pageNumber, pageData?.content?.length, selected?.id, status, viewMode]
    );

    const updateStatus = useCallback(
        async (taskId: number, nextStatus: TaskStatus) => {
            const current = selected && selected.id === taskId ? selected : serverTasks.find((x) => x.id === taskId);

            // Prevent updating if the task isn't found locally
            if (!current) return;

            // need full payload for PUT (CreateTaskDto)
            const dto: CreateTaskDto = {
                title: current.title,
                description: current?.description ?? undefined,
                trackingStatus: nextStatus,
            };

            await api.tasks.update(taskId, dto);

            // refresh list + selected
            await refresh();
            try {
                const fresh = await api.tasks.getById(taskId);
                setSelected(fresh);
            } catch {
                // ignore
            }
        },
        [refresh, selected, serverTasks]
    );

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{viewMode === "ALL" ? "All Tasks" : "My Tasks"}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage and track the progress of your projects.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        className="h-10 px-4"
                        onClick={() => {
                            setQuery("");
                            setStatus("ALL");
                            setSortKey("recent");
                            setPageNumber(0);
                        }}
                    >
                        Reset Filters
                    </Button>

                    <Button
                        variant="secondary"
                        className="h-10 px-4"
                        onClick={() => {
                            setFormMode("create");
                            setFormInitial(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
                <TaskToolbar
                    query={query}
                    setQuery={setQuery}
                    status={status}
                    setStatus={setStatus}
                    sortKey={sortKey}
                    setSortKey={setSortKey}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    canViewAll={canViewAll}
                />

                <Card className="rounded-2xl border-border/60 bg-card/50 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6">
                        {error && <ErrorState message={error} />}

                        {isLoading ? (
                            <TaskSkeleton />
                        ) : filtered.length === 0 ? (
                            <EmptyState
                                title={query.trim() ? "No matches on this page" : "No tasks found"}
                                hint={
                                    query.trim()
                                        ? "Try a different search, switch pages, or clear filters."
                                        : "Create your first task to get started."
                                }
                            />
                        ) : (
                            <TaskList
                                tasks={filtered}
                                onOpenTask={openDetails}
                                onEdit={(t) => {
                                    setFormMode("edit");
                                    setFormInitial(t);
                                    setFormOpen(true);
                                }}
                                onDelete={handleDelete}
                                onUpdateStatus={updateStatus}
                            />
                        )}

                        <Separator className="my-6" />

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                            <div className="text-sm text-muted-foreground">
                                {pageData ? (
                                    <>
                                        Page <span className="font-medium text-foreground">{pageData.number + 1}</span> of{" "}
                                        <span className="font-medium text-foreground">{pageData.totalPages}</span> •{" "}
                                        <span className="font-medium text-foreground">{pageData.totalElements}</span> total
                                    </>
                                ) : (
                                    "—"
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    className="h-9 px-4"
                                    disabled={!pageData || pageData.first || isLoading}
                                    onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-9 px-4"
                                    disabled={!pageData || pageData.last || isLoading}
                                    onClick={() => setPageNumber((p) => p + 1)}
                                >
                                    Next
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
                onUpdateStatus={updateStatus}
                onEdit={(t) => {
                    setFormMode("edit");
                    setFormInitial(t);
                    setFormOpen(true);
                }}
                onDelete={handleDelete}
            />

            <TaskFormSheet
                open={formOpen}
                onOpenChange={setFormOpen}
                mode={formMode}
                initial={formInitial}
                isSaving={isSaving}
                onSubmit={async (dto) => {
                    if (formMode === "create") {
                        await handleCreate(dto);
                    } else {
                        const id = formInitial?.id;
                        if (!id) return;
                        await handleUpdate(id, dto);
                    }
                }}
            />
        </div>
    );
}