import * as React from "react";
import { useMemo, useState } from "react";

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
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Circle,
    Clock3,
    MoreHorizontal,
    Plus,
    Search,
    User2,
} from "lucide-react";

/**
 * NOTE:
 * - Adjust "@/..." import aliases to your project structure if needed.
 * - Replace the hook stub (useAdminTasks) with your real data + mutations.
 */

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeName?: string | null;
    dueDate?: string | null; // ISO
    updatedAt?: string | null; // ISO
    createdAt?: string | null; // ISO
};

type SortKey = "updatedAt" | "dueDate" | "priority";

const statusMeta: Record<
    TaskStatus,
    { label: string; icon: React.ReactNode; badge: "secondary" | "default" | "destructive" | "outline" }
> = {
    TODO: { label: "To do", icon: <Circle className="h-4 w-4" />, badge: "outline" },
    IN_PROGRESS: { label: "In progress", icon: <Clock3 className="h-4 w-4" />, badge: "secondary" },
    DONE: { label: "Done", icon: <CheckCircle2 className="h-4 w-4" />, badge: "default" },
    BLOCKED: { label: "Blocked", icon: <AlertTriangle className="h-4 w-4" />, badge: "destructive" },
};

const priorityMeta: Record<TaskPriority, { label: string; className: string }> = {
    LOW: { label: "Low", className: "text-muted-foreground" },
    MEDIUM: { label: "Medium", className: "text-foreground" },
    HIGH: { label: "High", className: "text-foreground font-medium" },
};

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit", year: "numeric" }).format(d);
}

function sortTasks(tasks: Task[], sortKey: SortKey) {
    const copy = [...tasks];
    const priorityRank: Record<TaskPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    copy.sort((a, b) => {
        if (sortKey === "priority") return priorityRank[b.priority] - priorityRank[a.priority];

        if (sortKey === "dueDate") {
            const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
            const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
            return at - bt;
        }

        const at = a.updatedAt ?? a.createdAt;
        const bt = b.updatedAt ?? b.createdAt;
        const aTime = at ? new Date(at).getTime() : 0;
        const bTime = bt ? new Date(bt).getTime() : 0;
        return bTime - aTime;
    });

    return copy;
}

function TaskToolbar({
    query,
    setQuery,
    status,
    setStatus,
    priority,
    setPriority,
    sortKey,
    setSortKey,
    rightSlot,
}: {
    query: string;
    setQuery: (v: string) => void;
    status: TaskStatus | "ALL";
    setStatus: (v: TaskStatus | "ALL") => void;
    priority: TaskPriority | "ALL";
    setPriority: (v: TaskPriority | "ALL") => void;
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
                    <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All priorities</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="updatedAt">Recently updated</SelectItem>
                            <SelectItem value="dueDate">Due date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>

                    {rightSlot}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <Tabs value={status} onValueChange={(v) => setStatus(v as any)} className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="ALL" className="min-w-[72px]">
                            All
                        </TabsTrigger>
                        <TabsTrigger value="TODO">To do</TabsTrigger>
                        <TabsTrigger value="IN_PROGRESS">In progress</TabsTrigger>
                        <TabsTrigger value="DONE">Done</TabsTrigger>
                        <TabsTrigger value="BLOCKED">Blocked</TabsTrigger>
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
    task: Task | null;
}) {
    if (!task) return null;
    const s = statusMeta[task.status];

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
                        <span className={cn("text-xs", priorityMeta[task.priority].className)}>
                            {priorityMeta[task.priority].label} priority
                        </span>
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
                                Assignee
                            </div>
                            <div className="truncate">{task.assigneeName ?? "Unassigned"}</div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Due
                            </div>
                            <div>{formatDate(task.dueDate)}</div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="text-muted-foreground">Updated</div>
                            <div>{formatDate(task.updatedAt ?? task.createdAt)}</div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function TaskList({
    tasks,
    onOpenTask,
    onEdit,
    onAssign,
    onDelete,
}: {
    tasks: Task[];
    onOpenTask: (t: Task) => void;
    onEdit: (t: Task) => void;
    onAssign: (t: Task) => void;
    onDelete: (t: Task) => void;
}) {
    return (
        <div className="space-y-2">
            {/* Mobile cards */}
            <div className="grid gap-2 md:hidden">
                {tasks.map((t) => {
                    const s = statusMeta[t.status];
                    return (
                        <button
                            key={t.id}
                            onClick={() => onOpenTask(t)}
                            className="w-full rounded-xl border bg-card p-3 text-left shadow-sm transition hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate font-medium">{t.title}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant={s.badge} className="gap-1">
                                            {s.icon}
                                            {s.label}
                                        </Badge>
                                        <span className={priorityMeta[t.priority].className}>{priorityMeta[t.priority].label}</span>
                                        <span>Due {formatDate(t.dueDate)}</span>
                                        <span>•</span>
                                        <span className="truncate">Assignee: {t.assigneeName ?? "Unassigned"}</span>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onOpenTask(t)}>View</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(t)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onAssign(t)}>Assign</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(t)}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead className="w-[42%]">Task</TableHead>
                            <TableHead className="w-[18%]">Assignee</TableHead>
                            <TableHead className="w-[16%]">Status</TableHead>
                            <TableHead className="w-[12%]">Priority</TableHead>
                            <TableHead className="w-[10%]">Due</TableHead>
                            <TableHead className="w-[2%]" />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {tasks.map((t) => {
                            const s = statusMeta[t.status];
                            return (
                                <TableRow key={t.id} className="cursor-pointer hover:bg-accent/30" onClick={() => onOpenTask(t)}>
                                    <TableCell className="py-3">
                                        <div className="space-y-1">
                                            <div className="font-medium leading-tight">{t.title}</div>
                                            <div className="truncate text-xs text-muted-foreground max-w-[560px]">
                                                {t.description || "No description"}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">{t.assigneeName ?? "Unassigned"}</TableCell>

                                    <TableCell>
                                        <Badge variant={s.badge} className="gap-1">
                                            {s.icon}
                                            {s.label}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className={cn("text-sm", priorityMeta[t.priority].className)}>
                                        {priorityMeta[t.priority].label}
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">{formatDate(t.dueDate)}</TableCell>

                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onOpenTask(t)}>View</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(t)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAssign(t)}>Assign</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(t)}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

function TaskEditorDialog({
    open,
    onOpenChange,
    initial,
    onSave,
    title,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: Partial<Task> | null;
    onSave: (payload: { title: string; description?: string; priority: TaskPriority; dueDate?: string | null }) => Promise<void> | void;
    title: string;
}) {
    const [taskTitle, setTaskTitle] = useState(initial?.title ?? "");
    const [desc, setDesc] = useState(initial?.description ?? "");
    const [priority, setPriority] = useState<TaskPriority>((initial?.priority as TaskPriority) ?? "MEDIUM");
    const [dueDate, setDueDate] = useState<string>(initial?.dueDate?.slice(0, 10) ?? "");
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        if (open) {
            setTaskTitle(initial?.title ?? "");
            setDesc(initial?.description ?? "");
            setPriority((initial?.priority as TaskPriority) ?? "MEDIUM");
            setDueDate(initial?.dueDate?.slice(0, 10) ?? "");
            setSaving(false);
        }
    }, [open, initial]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Short, clear, actionable.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="taskTitle">Title</Label>
                        <Input
                            id="taskTitle"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="e.g. Review weekly report"
                            minLength={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="taskDesc">Description</Label>
                        <Textarea
                            id="taskDesc"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Optional. Add context, acceptance criteria, or links."
                            className="min-h-[96px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="LOW">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Due date</Label>
                            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                setSaving(true);
                                try {
                                    await onSave({
                                        title: taskTitle.trim(),
                                        description: desc.trim() || undefined,
                                        priority,
                                        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
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

/** Replace with your real hook */
function useAdminTasks(): {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    createTask: (payload: { title: string; description?: string; priority: TaskPriority; dueDate?: string | null }) => Promise<void>;
    updateTask: (taskId: string, payload: { title: string; description?: string; priority: TaskPriority; dueDate?: string | null }) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    // optionally: assignTask(taskId, userId)
} {
    const tasks: Task[] = [
        {
            id: "t1",
            title: "Audit overdue tasks",
            description: "Review tasks past due date and notify assignees.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            assigneeName: "Juan",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "t2",
            title: "Finalize sprint board",
            description: "Confirm priorities with stakeholders.",
            status: "TODO",
            priority: "MEDIUM",
            assigneeName: null,
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: "t3",
            title: "Clean up task templates",
            description: null,
            status: "DONE",
            priority: "LOW",
            assigneeName: "Mia",
            dueDate: null,
            updatedAt: new Date().toISOString(),
        },
    ];

    return {
        tasks,
        isLoading: false,
        error: null,
        createTask: async () => { },
        updateTask: async () => { },
        deleteTask: async () => { },
    };
}

export default function AdminTasksPage() {
    const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useAdminTasks();

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
    const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
    const [sortKey, setSortKey] = useState<SortKey>("updatedAt");

    const [selected, setSelected] = useState<Task | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<Task | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = tasks;

        if (status !== "ALL") list = list.filter((t) => t.status === status);
        if (priority !== "ALL") list = list.filter((t) => t.priority === priority);

        if (q) {
            list = list.filter((t) => {
                const hay = `${t.title} ${t.description ?? ""} ${t.assigneeName ?? ""}`.toLowerCase();
                return hay.includes(q);
            });
        }

        return sortTasks(list, sortKey);
    }, [tasks, query, status, priority, sortKey]);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <div className="flex items-end justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
                    <p className="text-sm text-muted-foreground">Manage tasks across the system.</p>
                </div>

                <Button
                    className="gap-2"
                    onClick={() => {
                        setEditing(null);
                        setEditorOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4" />
                    New task
                </Button>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
                <TaskToolbar
                    query={query}
                    setQuery={setQuery}
                    status={status}
                    setStatus={setStatus}
                    priority={priority}
                    setPriority={setPriority}
                    sortKey={sortKey}
                    setSortKey={setSortKey}
                    rightSlot={
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setQuery("");
                                setStatus("ALL");
                                setPriority("ALL");
                                setSortKey("updatedAt");
                            }}
                        >
                            Reset
                        </Button>
                    }
                />

                <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
                    <div className="p-4 sm:p-5">
                        {error && <ErrorState message={error} />}

                        {isLoading ? (
                            <TaskSkeleton />
                        ) : filtered.length === 0 ? (
                            <EmptyState title="No tasks found" hint="Try adjusting filters or create a new task." />
                        ) : (
                            <TaskList
                                tasks={filtered}
                                onOpenTask={(t) => {
                                    setSelected(t);
                                    setDetailsOpen(true);
                                }}
                                onEdit={(t) => {
                                    setEditing(t);
                                    setEditorOpen(true);
                                }}
                                onAssign={(t) => {
                                    // hook this to your Assign flow (dialog/sheet/search users)
                                    setSelected(t);
                                    setDetailsOpen(true);
                                }}
                                onDelete={async (t) => {
                                    // recommend confirm dialog in real app
                                    await deleteTask(t.id);
                                }}
                            />
                        )}
                    </div>
                </Card>
            </div>

            <TaskDetailsSheet open={detailsOpen} onOpenChange={setDetailsOpen} task={selected} />

            <TaskEditorDialog
                open={editorOpen}
                onOpenChange={setEditorOpen}
                initial={editing}
                title={editing ? "Edit task" : "Create task"}
                onSave={async (payload) => {
                    if (editing) await updateTask(editing.id, payload);
                    else await createTask(payload);
                }}
            />
        </div>
    );
}
