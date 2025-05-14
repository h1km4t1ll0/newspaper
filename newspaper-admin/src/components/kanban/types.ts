export interface Task {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    re: null;
    assignee: null | {
        data: {
            attributes: {
                username: string;
            };
        };
    };
    articles: Array<{
        id: number;
        name: string;
        text: string;
    }>;
    photos: Array<{
        id: number;
        name: string;
        url: string;
    }>;
}

export interface KanbanTask {
    id: number;
    title: string;
    description: string;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    assignee: string;
    articles?: Array<{
        id: number;
        name: string;
        text: string;
    }>;
    photos?: Array<{
        id: number;
        name: string;
        url: string;
    }>;
}

export interface KanbanColumn {
    id: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    title: string;
    tasks: KanbanTask[];
}

export interface FilterOptions {
    search: string;
    assignee: string | null;
    status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | null;
} 