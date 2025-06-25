export interface Task {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  taskType?: "WRITING" | "PHOTOGRAPHY" | "LAYOUT" | "EDITING" | "REVIEW";
  assignee?: {
    id: number;
    username: string;
    email: string;
  };
  issue?: {
    id: number;
    name: string;
    PublishDate: string;
  };
  articles?: Array<{
    id: number;
    name: string;
    text: string;
  }>;
  photos?: Array<{
    id: number;
    name: string;
    photo?: {
      url: string;
    };
  }>;
}

export interface KanbanTask {
  id: number;
  title: string;
  name?: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  taskType?: "WRITING" | "PHOTOGRAPHY" | "LAYOUT" | "EDITING" | "REVIEW";
  assignee?: string;
  assigneeId?: number;
  issueName?: string;
  issueId?: number;
  issueDate?: string;
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
  id: "TO_DO" | "IN_PROGRESS" | "DONE";
  title: string;
  tasks: KanbanTask[];
}

export interface FilterOptions {
  search: string;
  assignee: string | null;
  status: "TO_DO" | "IN_PROGRESS" | "DONE" | null;
}
