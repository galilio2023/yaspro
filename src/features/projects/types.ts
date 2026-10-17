export type ProjectCategory =
  | "all"
  | "government"
  | "commercial"
  | "shows"
  | "documentary"
  | "event"
  | "influencer";

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  arabicTitle?: string;
  category: ProjectCategory;
  categoryLabel: string;
  client: string;
  description: string;
  arabicDescription?: string;
  tag: string;
  views: string;
  image?: string;
  vimeoId?: string;
  videoUrl?: string;
  year?: string;
  deliverables?: string[];
  techStack?: string[];
}
