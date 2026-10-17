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
  categoryLabelAr?: string;
  client: string;
  arabicClient?: string;
  description: string;
  arabicDescription?: string;
  tag: string;
  arabicTag?: string;
  views: string;
  arabicViews?: string;
  image?: string;
  vimeoId?: string;
  videoUrl?: string;
  year?: string;
  deliverables?: string[];
  arabicDeliverables?: string[];
  techStack?: string[];
  arabicTechStack?: string[];
}
