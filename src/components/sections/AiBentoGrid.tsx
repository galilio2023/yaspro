import React from "react";
import Image from "next/image";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Wand2, Layers, AudioWaveform, Focus, Film } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AiBentoGrid() {
  const { isArabic } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Card 1: Virtual Production (Large) */}
      <FadeUp delay={0.1} className="md:col-span-2 relative group overflow-hidden rounded-[2rem] bg-slate-950 border border-white/10 p-8 min-h-[350px] sm:min-h-[400px] flex flex-col justify-end">
        <Image
          src="/images/ai/virtual_sets.jpg"
          alt="Generative Virtual Sets"
          fill
          className="object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 to-brand-cyan/10 mix-blend-color opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
        
        <div className="relative z-10 max-w-xl">
          <div className="size-12 rounded-2xl bg-brand-purple/30 border border-brand-purple/40 backdrop-blur-md flex items-center justify-center text-white mb-5 shadow-lg">
            <Layers size={24} />
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight drop-shadow-md">
            {isArabic ? "استوديوهات افتراضية توليدية" : "Generative Virtual Sets"}
          </h3>
          <p className="text-slate-200 text-lg max-w-md drop-shadow-md">
            {isArabic 
              ? "بيئات مدعومة بمحرك Unreal Engine تتفاعل مع إضاءة الاستوديو وحركة الكاميرا في الوقت الفعلي."
              : "Unreal Engine powered environments that react to studio lighting and camera tracking in real-time."}
          </p>
        </div>
      </FadeUp>

      {/* Card 2: AI Auto-Framing */}
      <FadeUp delay={0.2} className="relative group overflow-hidden rounded-[2rem] bg-slate-950 border border-white/10 p-8 min-h-[350px] sm:min-h-[400px] flex flex-col justify-end">
        <Image
          src="/images/ai/auto_framing.jpg"
          alt="AI Auto-Framing"
          fill
          className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-transparent mix-blend-overlay opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="size-12 rounded-2xl bg-brand-cyan/30 border border-brand-cyan/40 backdrop-blur-md flex items-center justify-center text-white mb-4 shadow-lg">
            <Focus size={24} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
            {isArabic ? "التتبع التلقائي للذكاء الاصطناعي" : "AI Auto-Framing"}
          </h3>
          <p className="text-slate-300 text-sm drop-shadow-md">
            {isArabic
              ? "كاميرات روبوتية تتبع الأهداف وتؤطر اللقطات تلقائيًا."
              : "Robotic cameras that dynamically track subjects and frame shots automatically."}
          </p>
        </div>
      </FadeUp>

      {/* Card 3: Audio Cleanup */}
      <FadeUp delay={0.3} className="relative group overflow-hidden rounded-[2rem] bg-slate-950 border border-white/10 p-8 min-h-[300px] flex flex-col justify-end">
        <Image
          src="/images/ai/audio_cleanup.jpg"
          alt="Deep Audio Cleanup"
          fill
          className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 mix-blend-color" />
        
        <div className="relative z-10">
          <div className="size-10 rounded-xl bg-amber-500/30 border border-amber-500/40 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-md">
            <AudioWaveform size={20} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
            {isArabic ? "تنقية الصوت العميقة" : "Deep Audio Cleanup"}
          </h3>
          <p className="text-slate-300 text-sm drop-shadow-sm">
            {isArabic ? "عزل الصوت وإزالة ضوضاء الخلفية على الفور." : "Isolate voices and remove background noise instantly."}
          </p>
        </div>
      </FadeUp>

      {/* Card 4: Generative Storyboarding */}
      <FadeUp delay={0.4} className="relative group overflow-hidden rounded-[2rem] bg-slate-950 border border-white/10 p-8 min-h-[300px] flex flex-col justify-end">
        <Image
          src="/images/ai/gen_storyboarding.jpg"
          alt="Generative Storyboarding"
          fill
          className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 mix-blend-color" />
        
        <div className="relative z-10">
          <div className="size-10 rounded-xl bg-emerald-500/30 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-md">
            <Film size={20} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
            {isArabic ? "لوحات القصة التوليدية" : "Gen-Storyboarding"}
          </h3>
          <p className="text-slate-300 text-sm drop-shadow-sm">
            {isArabic ? "تحويل النصوص إلى لوحات قصة مرئية قبل الإنتاج." : "Transform scripts into visual storyboards instantly."}
          </p>
        </div>
      </FadeUp>

      {/* Card 5: AI Color Grading */}
      <FadeUp delay={0.5} className="relative group overflow-hidden rounded-[2rem] bg-slate-950 border border-white/10 p-8 min-h-[300px] flex flex-col justify-end">
        <Image
          src="/images/ai/color_matching.jpg"
          alt="AI Color Matching"
          fill
          className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 mix-blend-color" />
        
        <div className="relative z-10">
          <div className="size-10 rounded-xl bg-blue-500/30 border border-blue-500/40 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-md">
            <Wand2 size={20} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">
            {isArabic ? "تلوين سينمائي ذكي" : "AI Color Matching"}
          </h3>
          <p className="text-slate-300 text-sm drop-shadow-sm">
            {isArabic ? "مطابقة ألوان الكاميرات المتعددة تلقائياً." : "Automatically match color profiles across multi-cam setups."}
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
