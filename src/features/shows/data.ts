export interface ShowItem {
  id: string;
  title: string;
  arabicTitle: string;
  category: "Talk Show" | "Reality / Social" | "Entertainment" | "Fashion & Lifestyle";
  views: string;
  episodes: string;
  description: string;
  badge?: string;
  tags: string[];
  vimeoId: string;
  thumbnail: string;
  posterBg: string;
}

export const SHOWS_DATA: readonly ShowItem[] = [
  {
    id: "room-11",
    title: "Room 11 with Dyler",
    arabicTitle: "غرفة 11 مع دايلر",
    category: "Reality / Social",
    views: "120M+ Views",
    episodes: "Season 2",
    description: "Intense, cinematic multi-camera psychological and social experiment series filmed in Dubai creator soundstages.",
    badge: "Viral Hit",
    tags: ["Social Experiment", "Multi-Cam", "Trending"],
    vimeoId: "892926258",
    thumbnail: "/images/shows/room-11.jpg",
    posterBg: "from-brand-purple/40 via-blue-900/30 to-black",
  },
  {
    id: "the-signature",
    title: "The Signature with Zeina",
    arabicTitle: "ذا سيجنتشر",
    category: "Entertainment",
    views: "60M+ Views",
    episodes: "Season 1",
    description: "Creative fashion showdown in partnership with Rotana Digital Network featuring top creators and stylists in custom studio challenges.",
    badge: "Rotana Special",
    tags: ["Rotana Digital", "Studio Contest", "High-Energy"],
    vimeoId: "892926106",
    thumbnail: "/images/shows/the-signature.jpg",
    posterBg: "from-cyan-600/30 via-brand-purple/25 to-black",
  },
  {
    id: "tneen-fe-khalat",
    title: "Tneen fe Khalat with Nour Mar",
    arabicTitle: "اتنين في خلاط مع نور مار",
    category: "Entertainment",
    views: "95M+ Views",
    episodes: "Weekly Series",
    description: "Fast-paced comedy and creator talk show mixing unexpected guest duos in high-speed banter and challenges.",
    badge: "Nour Mar Hit",
    tags: ["Comedy", "Nour Mar", "Viral"],
    vimeoId: "892926216",
    thumbnail: "/images/shows/tneen-fe-khalat.jpg",
    posterBg: "from-rose-600/30 via-brand-purple/20 to-black",
  },
  {
    id: "fashion-lounge",
    title: "Fashion Lounge - Arab Fashion Week",
    arabicTitle: "فاشن لاونج أسبوع الموضة العربي",
    category: "Fashion & Lifestyle",
    views: "45M+ Views",
    episodes: "Bi-Weekly",
    description: "High-fashion aesthetic showcase exploring the style vision and runway highlights of Arab Fashion Week with macro 4K optics.",
    tags: ["Arab Fashion Week", "Luxury", "Aesthetic 4K"],
    badge: "Fashion Week",
    vimeoId: "892926157",
    thumbnail: "/images/shows/fashion-lounge.jpg",
    posterBg: "from-fuchsia-600/30 via-brand-purple/20 to-black",
  },
  {
    id: "ehzar-el-mashhour",
    title: "Ehzar El Mashhour - Guess the YouTuber",
    arabicTitle: "احذر المشهور",
    category: "Reality / Social",
    views: "70M+ Views",
    episodes: "Season 1",
    description: "Interactive celebrity prank and hidden-camera challenge where guests try to identify famous YouTubers.",
    tags: ["Prank", "Celebrities", "YouTube Challenge"],
    vimeoId: "892926299",
    thumbnail: "/images/shows/ehzar-el-mashhour.jpg",
    posterBg: "from-indigo-600/30 via-brand-cyan/20 to-black",
  },
  {
    id: "aghla-mn-al-dahab",
    title: "Aghla mn Al-Dahab",
    arabicTitle: "أغلى من الذهب",
    category: "Talk Show",
    views: "85M+ Views",
    episodes: "Season 2",
    description: "High-profile celebrity and cultural interviews spotlighting extraordinary stories and human triumph across the Arab world.",
    badge: "Flagship Show",
    tags: ["Celebrity", "Culture", "In-Depth"],
    vimeoId: "892926038",
    thumbnail: "/images/shows/aghla-mn-al-dahab.jpg",
    posterBg: "from-amber-600/30 via-brand-purple/20 to-black",
  },
];
