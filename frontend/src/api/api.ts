
import type { ChangePasswordDto, CreatePersonDto, LoginPersonDto, PersonDto } from "./types/Person";
import type { TaskDto, CreateTaskDto } from "./types/Task";
import type { Status, } from "./types/Status";
import { http } from "./http";

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
    pageable?: any;
    sort?: any;
}

const AUTH_BASE = "/auth";
const PERSON_BASE = "/persons";
const TASK_BASE = "/tasks";

export const api = {
    auth: {
        register: (body: CreatePersonDto) => http.post<PersonDto>(`${AUTH_BASE}/register`, body).then(r => r.data),
        login: (body: LoginPersonDto) => http.post<PersonDto>(`${AUTH_BASE}/login`, body).then(r => r.data),
        logout: () => http.post<void>(`${AUTH_BASE}/logout`).then(r => r.data),
        me: () => http.get<PersonDto>(`${AUTH_BASE}/me`).then(r => r.data),
    },

    persons: {
        findById: (id: number) => http.get<PersonDto>(`${PERSON_BASE}/${id}`).then(r => r.data),
        findAll: () => http.get<PersonDto[]>(`${PERSON_BASE}/all`).then(r => r.data),
        findAllPaginated: (pageNumber: number) =>
            http.get<Page<PersonDto>>(`${PERSON_BASE}/paginated/${pageNumber}`).then(r => r.data),

        // optional (from your PersonController)
        login: (body: LoginPersonDto) => http.post<PersonDto>(`${PERSON_BASE}/login`, body).then(r => r.data),
        addAdmin: (body: CreatePersonDto) => http.post<PersonDto>(`${PERSON_BASE}/add-admin`, body).then(r => r.data),
        registerUser: (body: CreatePersonDto) =>
            http.post<PersonDto>(`${PERSON_BASE}/register-user`, body).then(r => r.data),

        patchProfile: (id: number, body: { fullName?: string; username?: string }) =>
            http.patch<PersonDto>(`${PERSON_BASE}/${id}/profile`, body).then(r => r.data),

        changePassword: (id: number, body: ChangePasswordDto) =>
            http.put<PersonDto>(`${PERSON_BASE}/${id}/password`, body).then(r => r.data),

        delete: (id: number) => http.delete<void>(`${PERSON_BASE}/${id}`).then(r => r.data),
    },

    tasks: {
        // ADMIN
        getAllPaginated: (pageNumber: number) =>
            http.get<Page<TaskDto>>(`${TASK_BASE}/paginated/${pageNumber}`).then(r => r.data),

        getById: (taskId: number) =>
            http.get<TaskDto>(`${TASK_BASE}/${taskId}`).then(r => r.data),

        // USER
        getMyTasksPaginated: (pageNumber: number) =>
            http.get<Page<TaskDto>>(`${TASK_BASE}/my-tasks/paginated/${pageNumber}`).then(r => r.data),

        getMyTasksByStatusPaginated: (pageNumber: number, status: Status) =>
            http.get<Page<TaskDto>>(`${TASK_BASE}/my-tasks/filter/paginated/${pageNumber}`, { params: { status } }).then(r => r.data),

        // ADMIN
        getByStatusPaginated: (status: Status, pageNumber: number) =>
            http.get<Page<TaskDto>>(`${TASK_BASE}/status/${status}/paginated/${pageNumber}`).then(r => r.data),

        create: (body: CreateTaskDto) =>
            http.post<TaskDto>(`${TASK_BASE}`, body).then(r => r.data),

        update: (taskId: number, body: CreateTaskDto) =>
            http.put<TaskDto>(`${TASK_BASE}/${taskId}`, body).then(r => r.data),

        delete: (taskId: number) =>
            http.delete<void>(`${TASK_BASE}/${taskId}`).then(r => r.data),
    },
};
