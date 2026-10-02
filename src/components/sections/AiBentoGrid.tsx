import React from "react";
import Image from "next/image";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Wand2, Layers, AudioWaveform, Focus, Film } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AiBentoGrid() {
  const { isArabic } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
      {/* Card 1: Virtual Production (Large) */}
      <FadeUp delay={0.1} className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-zinc-900/90 border border-white/8 hover:border-white/20 p-8 sm:p-10 min-h-[360px] sm:min-h-[420px] flex flex-col justify-end transition-all duration-300 shadow-xl shadow-black/40">
        <Image
          src="/images/ai/virtual_sets.jpg"
          alt="Generative Virtual Sets"
          fill
          className="object-cover opacity-45 group-hover:opacity-65 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/65 to-transparent" />
        
        <div className="relative z-10 max-w-xl">
          <div className="size-11 rounded-xl bg-zinc-800/90 border border-white/15 backdrop-blur-md flex items-center justify-center text-amber-400 mb-5 shadow-lg">
            <Layers size={22} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            {isArabic ? "استوديوهات افتراضية توليدية" : "Generative Virtual Sets"}
          </h3>
          <p className="text-zinc-300 text-base sm:text-lg max-w-md leading-relaxed">
            {isArabic 
              ? "بيئات مدعومة بمحرك Unreal Engine تتفاعل مع إضاءة الاستوديو وحركة الكاميرا في الوقت الفعلي."
              : "Unreal Engine powered environments that react to studio lighting and camera tracking in real-time."}
          </p>
        </div>
      </FadeUp>

      {/* Card 2: AI Auto-Framing */}
      <FadeUp delay={0.2} className="relative group overflow-hidden rounded-3xl bg-zinc-900/90 border border-white/8 hover:border-white/20 p-8 min-h-[360px] sm:min-h-[420px] flex flex-col justify-end transition-all duration-300 shadow-xl shadow-black/40">
        <Image
          src="/images/ai/auto_framing.jpg"
          alt="AI Auto-Framing"
          fill
          className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        
        <div className="relative z-10">
          <div className="size-11 rounded-xl bg-zinc-800/90 border border-white/15 backdrop-blur-md flex items-center justify-center text-emerald-400 mb-4 shadow-lg">
            <Focus size={22} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {isArabic ? "التتبع التلقائي للذكاء الاصطناعي" : "AI Auto-Framing"}
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {isArabic
              ? "كاميرات روبوتية تتبع الأهداف وتؤطر اللقطات تلقائيًا."
              : "Robotic cameras that dynamically track subjects and frame shots automatically."}
          </p>
        </div>
      </FadeUp>

      {/* Card 3: Audio Cleanup */}
      <FadeUp delay={0.3} className="relative group overflow-hidden rounded-3xl bg-zinc-900/90 border border-white/8 hover:border-white/20 p-7 min-h-[300px] flex flex-col justify-end transition-all duration-300 shadow-xl shadow-black/40">
        <Image
          src="/images/ai/audio_cleanup.jpg"
          alt="Deep Audio Cleanup"
          fill
          className="object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        
        <div className="relative z-10">
          <div className="size-10 rounded-xl bg-zinc-800/90 border border-white/15 backdrop-blur-md flex items-center justify-center text-amber-400 mb-3 shadow-md">
            <AudioWaveform size={20} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            {isArabic ? "تنقية الصوت العميقة" : "Deep Audio Cleanup"}
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            {isArabic ? "عزل الصوت وإزالة ضوضاء الخلفية على الفور." : "Isolate voices and remove background noise instantly."}
          </p>
        </div>
      </FadeUp>

      {/* Card 4: Generative Storyboarding */}
      <FadeUp delay={0.4} className="relative group overflow-hidden rounded-3xl bg-zinc-900/90 border border-white/8 hover:border-white/20 p-7 min-h-[300px] flex flex-col justify-end transition-all duration-300 shadow-xl shadow-black/40">
        <Image
          src="/images/ai/gen_storyboarding.jpg"
          alt="Generative Storyboarding"
          fill
          className="object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        
        <div className="relative z-10">
          <div className="size-10 rounded-xl bg-zinc-800/90 border border-white/15 backdrop-blur-md flex items-center justify-center text-zinc-200 mb-3 shadow-md">
            <Film size={20} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            {isArabic ? "لوحات القصة التوليدية" : "Gen-Storyboarding"}
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            {isArabic ? "تحويل النصوص إلى لوحات قصة مرئية قبل الإنتاج." : "Transform scripts into visual storyboards instantly."}
          </p>
        </div>
      </FadeUp>

      {/* Card 5: AI Color Grading */}
      <FadeUp delay={0.5} className="relative group overflow-hidden rounded-3xl bg-zinc-900/90 border border-white/8 hover:border-white/20 p-7 min-h-[300px] flex flex-col justify-end transition-all duration-300 shadow-xl shadow-black/40">
        <Image
          src="/images/ai/color_matching.jpg"
          alt="AI Color Matching"
          fill
          className="object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        
        <div className="relative z-10">
          <div className="size-10 rounded-xl bg-zinc-800/90 border border-white/15 backdrop-blur-md flex items-center justify-center text-zinc-200 mb-3 shadow-md">
            <Wand2 size={20} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            {isArabic ? "تلوين سينمائي ذكي" : "AI Color Matching"}
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            {isArabic ? "مطابقة ألوان الكاميرات المتعددة تلقائياً." : "Automatically match color profiles across multi-cam setups."}
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
