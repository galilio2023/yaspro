export interface VirtualStudioScene {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  badgeColor: string;
  splitVideoSrc: string;   // The authentic 50/50 split reel from yasproductions.com
  greenVideoSrc: string;   // Full green screen stage video (ready to swap with full reel)
  virtualVideoSrc: string; // Full 3D virtual environment video (ready to swap with full reel)
  stackedVideoSrc: string; // Single frame-locked video: green stage (top half) + 3D composite (bottom half)
  lightingType: string;
  trackingEngine: string;
}

export const VIRTUAL_HERO_SCENE: VirtualStudioScene = {
  id: "virtual-stage-split",
  name: "Live XR Studio Split (Green vs 3D)",
  category: "Virtual Production & XR",
  description: "Authentic Yas Pro studio production demonstrating live camera green-screen capture against the real-time Unreal Engine 3D virtual environment with show presenters.",
  badge: "Unreal 5.4 Live Composite",
  badgeColor: "#10b981",
  splitVideoSrc: "/videos/grading/virtual-studio-split-reel.mp4",
  greenVideoSrc: "/videos/grading/virtual-green-stage.mp4",
  virtualVideoSrc: "/videos/grading/virtual-3d-stage.mp4",
  stackedVideoSrc: "/videos/grading/virtual-studio-stacked.mp4",
  lightingType: "Studio Key Light + Virtual City Skyline Rim",
  trackingEngine: "Mo-Sys StarTracker Optical",
};

export const VIRTUAL_SCENES: VirtualStudioScene[] = [VIRTUAL_HERO_SCENE];
