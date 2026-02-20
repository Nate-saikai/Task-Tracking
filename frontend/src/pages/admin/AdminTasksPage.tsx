import * as React from "react";
import { useMemo, useState, useEffect, useCallback } from "react";

// API + types
import { api, type Page } from "@/api/api";
import type { TaskDto, CreateTaskDto } from "@/api/types/Task";
import type { Status } from "@/api/types/Status";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import {
    CheckCircle2,
    Circle,
    Clock3,
    MoreHorizontal,
    Plus,
    Search,
    User2,
} from "lucide-react";

type SortKey = "id" | "title";

const statusMeta: Record<
    Status,
    { label: string; icon: React.ReactNode; badge: "secondary" | "outline" | "secondary" }
> = {
    TO_DO: { label: "To do", icon: <Circle className="h-4 w-4" />, badge: "outline" },
    IN_PROGRESS: { label: "In progress", icon: <Clock3 className="h-4 w-4" />, badge: "secondary" },
    COMPLETED: { label: "Completed", icon: <CheckCircle2 className="h-4 w-4" />, badge: "secondary" },
};

function TaskToolbar({
    query,
    setQuery,
    status,
    setStatus,
    sortKey,
    setSortKey,
    rightSlot,
}: {
    query: string;
    setQuery: (v: string) => void;
    status: Status | "ALL";
    setStatus: (v: Status | "ALL") => void;
    sortKey: SortKey;
    setSortKey: (v: SortKey) => void;
    rightSlot?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks…" className="pl-9" />
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="id">Newest (ID)</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                        </SelectContent>
                    </Select>
                    {rightSlot}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <Tabs value={status} onValueChange={(v) => setStatus(v as any)} className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="ALL" className="min-w-[72px]">All</TabsTrigger>
                        <TabsTrigger value="TO_DO">To do</TabsTrigger>
                        <TabsTrigger value="IN_PROGRESS">In progress</TabsTrigger>
                        <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 md:hidden">{rightSlot}</div>
            </div>
        </div>
    );
}

function TaskSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[260px]" />
                        <Skeleton className="h-3 w-[180px]" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
            <div className="text-sm font-medium">{title}</div>
            {hint && <div className="mt-1 text-sm text-muted-foreground">{hint}</div>}
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {message}
        </div>
    );
}

function TaskDetailsSheet({
    open,
    onOpenChange,
    task,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    task: TaskDto | null;
}) {
    if (!task) return null;
    const s = statusMeta[task.trackingStatus as Status];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="space-y-1">
                    <SheetTitle className="leading-tight">{task.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <Badge variant={s.badge} className="gap-1">
                            {s.icon}
                            {s.label}
                        </Badge>
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-5 text-sm">
                    {task.description ? (
                        <p className="whitespace-pre-wrap text-foreground/90">{task.description}</p>
                    ) : (
                        <p className="text-muted-foreground">No description.</p>
                    )}
                    <Separator />
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User2 className="h-4 w-4" />
                                Owner ID
                            </div>
                            <div className="truncate">{task.userId}</div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function TaskEditorDialog({
    open,
    onOpenChange,
    initial,
    onSave,
    title,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: Partial<TaskDto> | null;
    onSave: (payload: { title: string; description?: string }) => Promise<void> | void;
    title: string;
}) {
    const [taskTitle, setTaskTitle] = useState(initial?.title ?? "");
    const [desc, setDesc] = useState(initial?.description ?? "");
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        if (open) {
            setTaskTitle(initial?.title ?? "");
            setDesc(initial?.description ?? "");
            setSaving(false);
        }
    }, [open, initial]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Provide task details below.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="taskTitle">Title</Label>
                        <Input
                            id="taskTitle"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="e.g. Audit security logs"
                            disabled={saving}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="taskDesc">Description</Label>
                        <Textarea
                            id="taskDesc"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Add context or links."
                            className="min-h-[96px]"
                            disabled={saving}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                setSaving(true);
                                try {
                                    await onSave({
                                        title: taskTitle.trim(),
                                        description: desc.trim() || undefined,
                                    });
                                    onOpenChange(false);
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            disabled={saving || taskTitle.trim().length < 3}
                        >
                            {saving ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminTasksPage() {
    const [pageData, setPageData] = useState<Page<TaskDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(0);

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<Status | "ALL">("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("id");

    const [selected, setSelected] = useState<TaskDto | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<TaskDto | null>(null);

    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = status === "ALL"
                ? await api.tasks.getAllPaginated(pageNumber)
                : await api.tasks.getByStatusPaginated(status, pageNumber);
            setPageData(data);
        } catch (err: any) {
            setError(err.message || "Failed to load tasks.");
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, status]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleSave = async (payload: { title: string; description?: string }) => {
        const dto: CreateTaskDto = {
            ...payload,
            trackingStatus: editing?.trackingStatus || "TO_DO"
        };
        try {
            if (editing) {
                await api.tasks.update(editing.id, dto);
            } else {
                await api.tasks.create(dto);
            }
            loadTasks();
        } catch (err: any) {
            alert(err.message || "Save failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await api.tasks.delete(id);
            loadTasks();
        } catch (err: any) {
            alert(err.message || "Delete failed");
        }
    };

    const filtered = useMemo(() => {
        const list = pageData?.content || [];
        const q = query.trim().toLowerCase();
        let result = q ? list.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) : list;

        return [...result].sort((a, b) => {
            if (sortKey === "title") return a.title.localeCompare(b.title);
            return b.id - a.id;
        });
    }, [pageData, query, sortKey]);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <div className="flex items-end justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Admin Tasks</h1>
                    <p className="text-sm text-muted-foreground">Manage all user tasks across the system.</p>
                </div>
                <Button className="gap-2" onClick={() => { setEditing(null); setEditorOpen(true); }}>
                    <Plus className="h-4 w-4" /> New Task
                </Button>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
                <TaskToolbar
                    query={query} setQuery={setQuery}
                    status={status} setStatus={setStatus}
                    sortKey={sortKey} setSortKey={setSortKey}
                    rightSlot={<Button variant="secondary" onClick={() => { setQuery(""); setStatus("ALL"); setSortKey("id"); setPageNumber(0); }}>Reset</Button>}
                />

                <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
                    <div className="p-4 sm:p-5">
                        {error && <ErrorState message={error} />}
                        {isLoading ? <TaskSkeleton /> : filtered.length === 0 ? (
                            <EmptyState title="No tasks found" />
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Owner ID</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map(t => (
                                            <TableRow key={t.id} className="cursor-pointer" onClick={() => { setSelected(t); setDetailsOpen(true); }}>
                                                <TableCell className="font-medium">{t.title}</TableCell>
                                                <TableCell>{t.userId}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusMeta[t.trackingStatus as Status].badge}>{t.trackingStatus}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { setEditing(t); setEditorOpen(true); }}>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(t.id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">Page {pageNumber + 1} of {pageData?.totalPages || 1}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled={pageNumber === 0} onClick={() => setPageNumber(p => p - 1)}>Prev</Button>
                                        <Button variant="outline" size="sm" disabled={pageData?.last} onClick={() => setPageNumber(p => p + 1)}>Next</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <TaskDetailsSheet open={detailsOpen} onOpenChange={setDetailsOpen} task={selected} />
            <TaskEditorDialog
                open={editorOpen}
                onOpenChange={setEditorOpen}
                initial={editing}
                title={editing ? "Edit Task" : "Create Task"}
                onSave={handleSave}
            />
        </div>
    );
}