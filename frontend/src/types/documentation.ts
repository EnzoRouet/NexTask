export interface DocSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export interface DocDetails {
  id: string;
  title: string;
  content: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}
