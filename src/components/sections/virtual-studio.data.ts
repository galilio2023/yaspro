export interface VirtualStudioScene {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  categoryAr?: string;
  description: string;
  descriptionAr?: string;
  badge: string;
  badgeAr?: string;
  badgeColor: string;
  splitVideoSrc: string;   // The authentic 50/50 split reel from yasproductions.com
  greenVideoSrc: string;   // Full green screen stage video (ready to swap with full reel)
  virtualVideoSrc: string; // Full 3D virtual environment video (ready to swap with full reel)
  stackedVideoSrc: string; // Single frame-locked video: green stage (top half) + 3D composite (bottom half)
  lightingType: string;
  lightingTypeAr?: string;
  trackingEngine: string;
  trackingEngineAr?: string;
}

export const VIRTUAL_HERO_SCENE: VirtualStudioScene = {
  id: "virtual-stage-split",
  name: "Live XR Studio Split (Green vs 3D)",
  nameAr: "تقسيم استوديو XR الحي (الشاشة الخضراء مقابل البيئة ثلاثية الأبعاد)",
  category: "Virtual Production & XR",
  categoryAr: "الإنتاج الافتراضي وتقنية XR",
  description: "Authentic Yas Pro studio production demonstrating live camera green-screen capture against the real-time Unreal Engine 3D virtual environment with show presenters.",
  descriptionAr: "إنتاج حقيقي من استوديوهات Yas Pro يوضح التقاط الكاميرا الحي على الشاشة الخضراء في مواجهة بيئة ثلاثية الأبعاد تفاعلية بمحرك أنريل إنجين في الوقت الفعلي مع مقدمي البرنامج.",
  badge: "Unreal 5.4 Live Composite",
  badgeAr: "تركيب حي بأنريل 5.4",
  badgeColor: "#10b981",
  splitVideoSrc: "/videos/grading/virtual-studio-split-reel.mp4",
  greenVideoSrc: "/videos/grading/virtual-green-stage.mp4",
  virtualVideoSrc: "/videos/grading/virtual-3d-stage.mp4",
  stackedVideoSrc: "/videos/grading/virtual-studio-stacked.mp4",
  lightingType: "Studio Key Light + Virtual City Skyline Rim",
  lightingTypeAr: "إضاءة استوديو رئيسية + إضاءة حافة أفق المدينة الافتراضية",
  trackingEngine: "Mo-Sys StarTracker Optical",
  trackingEngineAr: "تتبع بصري Mo-Sys StarTracker",
};
