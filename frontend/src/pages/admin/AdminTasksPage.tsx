import { useEffect, useState } from "react";
import { api } from "../../api/api";
import type { TaskDto } from "../../api/types/Task";
import type { Status } from "../../api/types/Status";

export default function AdminTasksPage() {
    const [page, setPage] = useState(0);
    const [status, setStatus] = useState<Status | "ALL">("ALL");
    const [data, setData] = useState<TaskDto[]>([]);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        (async () => {
            const res =
                status === "ALL"
                    ? await api.tasks.getAllPaginated(page)
                    : await api.tasks.getByStatusPaginated(status, page);

            setData(res.content);
            setTotalPages(res.totalPages);
        })();
    }, [page, status]);

    return (
        <div>
            <h2>Tasks</h2>

            <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
                <label>
                    Filter:
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        style={{ marginLeft: 8 }}
                    >
                        <option value="ALL">ALL</option>
                        <option value="TO_DO">TO_DO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </label>

                <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                    Prev
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                    Next
                </button>

                <span>
                    Page {page + 1} / {Math.max(totalPages, 1)}
                </span>
            </div>

            <table width="100%" cellPadding={10} style={{ borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>User ID</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((t) => (
                        <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td>{t.id}</td>
                            <td>{t.title}</td>
                            <td>{t.trackingStatus}</td>
                            <td>{t.userId}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={4}>No tasks found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
