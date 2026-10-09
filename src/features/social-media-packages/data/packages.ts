export interface PackageFeature {
  labelEn: string;
  labelAr: string;
  category?: "content" | "filming" | "motion" | "management";
}

export interface SocialMediaPackage {
  id: "starter" | "growth" | "premium" | "enterprise";
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  monthlyPrice: number | null; // null for custom
  yearlyPricePerMonth: number | null; // 20% discount
  isPopular?: boolean;
  ctaTextEn: string;
  ctaTextAr: string;
  ctaType: "purchase" | "contact";
  features: PackageFeature[];
  specsHighlights: {
    reels: string;
    posts: string;
    stories: string;
    filming: string;
  };
}

export const SOCIAL_MEDIA_PACKAGES: SocialMediaPackage[] = [
  {
    id: "starter",
    nameEn: "Starter",
    nameAr: "الباقة الأساسية",
    taglineEn: "Perfect for individuals and small teams getting started.",
    taglineAr: "مثالية للمبدعين والفرق الناشئة لبناء حضور رقمي قوي واحترافي.",
    monthlyPrice: 3000,
    yearlyPricePerMonth: 2400,
    ctaTextEn: "Purchase Plan",
    ctaTextAr: "اشتراك في الباقة",
    ctaType: "purchase",
    specsHighlights: {
      reels: "2 Reels",
      posts: "6 Posts",
      stories: "10 Stories",
      filming: "1/2 Day (4h)",
    },
    features: [
      {
        labelEn: "Videos: 2 Reel (15–45 sec)",
        labelAr: "فيديوهات: 2 ريلز بدقة 4K سينمائية (15–45 ثانية)",
        category: "content",
      },
      {
        labelEn: "Posts: 6 Carousel / HQ Photos",
        labelAr: "منشورات: 6 كاورسيل / صور فوتوغرافية احترافية",
        category: "content",
      },
      {
        labelEn: "Stories: 10 Monthly Stories",
        labelAr: "قصص تفاعلية: 10 ستوريز شهرية مصممة",
        category: "content",
      },
      {
        labelEn: "Visits: 1 Half Day (4 Hours)",
        labelAr: "جلسات تصوير: نصف يوم استوديو أو موقع (4 ساعات)",
        category: "filming",
      },
    ],
  },
  {
    id: "growth",
    nameEn: "Growth",
    nameAr: "باقة النمو",
    taglineEn: "Best for growing businesses with more needs.",
    taglineAr: "الخيار الأكثر طلباً للشركات والعلامات التجارية المتوسعة.",
    monthlyPrice: 6500,
    yearlyPricePerMonth: 5200,
    isPopular: true,
    ctaTextEn: "Purchase Plan",
    ctaTextAr: "اشتراك في الباقة",
    ctaType: "purchase",
    specsHighlights: {
      reels: "4 Reels",
      posts: "12 Posts",
      stories: "20 Stories",
      filming: "1 Full Day (8h)",
    },
    features: [
      {
        labelEn: "Videos: 4 Reels (15–45 sec)",
        labelAr: "فيديوهات: 4 ريلز احترافية (15–45 ثانية)",
        category: "content",
      },
      {
        labelEn: "Posts: 12 Carousel / HQ Photos",
        labelAr: "منشورات: 12 كاورسيل وصور تحريرية عالية الدقة",
        category: "content",
      },
      {
        labelEn: "Stories: 20 Monthly Stories",
        labelAr: "قصص تفاعلية: 20 ستوري تفاعلي شهرياً",
        category: "content",
      },
      {
        labelEn: "Motion Graphics: 1 Motion Outro",
        labelAr: "موشن جرافيك: أوتور موشن متحرك للشعار",
        category: "motion",
      },
      {
        labelEn: "Visits: 1 Full Day (8 Hours)",
        labelAr: "جلسات تصوير: يوم تصوير سينمائي كامل (8 ساعات)",
        category: "filming",
      },
      {
        labelEn: "Moderator: YES",
        labelAr: "إدارة تفاعل ومتابعة الردود: متضمنة",
        category: "management",
      },
      {
        labelEn: "Consultation: 1 Monthly Strategy Call",
        labelAr: "استشارات استراتيجية: مكالمة تخطيط شهرية",
        category: "management",
      },
    ],
  },
  {
    id: "premium",
    nameEn: "Premium",
    nameAr: "الباقة المتميزة",
    taglineEn: "For large organizations with advanced requirements.",
    taglineAr: "للمؤسسات الكبرى والعلامات الرائدة ذات المتطلبات الإنتاجية المتقدمة.",
    monthlyPrice: 10500,
    yearlyPricePerMonth: 8400,
    ctaTextEn: "Purchase Plan",
    ctaTextAr: "اشتراك في الباقة",
    ctaType: "purchase",
    specsHighlights: {
      reels: "8 Reels",
      posts: "16 Posts",
      stories: "30 Stories",
      filming: "2 Full Days (16h)",
    },
    features: [
      {
        labelEn: "Videos: 8 Reels (15–45 sec)",
        labelAr: "فيديوهات: 8 ريلز سينمائية مكثفة (15–45 ثانية)",
        category: "content",
      },
      {
        labelEn: "Posts: 16 Carousel / HQ Photos",
        labelAr: "منشورات: 16 بوست كاورسيل وتصوير فوتوغرافي فائق",
        category: "content",
      },
      {
        labelEn: "Stories: 30 Monthly Stories",
        labelAr: "قصص تفاعلية: 30 ستوري شهري (ستوري يومي)",
        category: "content",
      },
      {
        labelEn: "Motion Graphics: 2 Motion Intro + Outro",
        labelAr: "موشن جرافيك: إنترو وأوتور موشن مخصص للهوية",
        category: "motion",
      },
      {
        labelEn: "Identity Graphics Kit: One Time Full Graphics Identity Kit",
        labelAr: "حقيبة هوية مرئية: طقم قوالب وهوية بصرية رقمية شاملة",
        category: "motion",
      },
      {
        labelEn: "Visits: 2 Full Days (8 Hours each)",
        labelAr: "جلسات تصوير: يومان كاملان تصوير ميداني/استوديو (8 ساعات لكل يوم)",
        category: "filming",
      },
      {
        labelEn: "Moderator: YES",
        labelAr: "إدارة التفاعل والمجتمع: متضمنة",
        category: "management",
      },
      {
        labelEn: "Account Manager: YES",
        labelAr: "مدير حساب مخصص: نعم",
        category: "management",
      },
      {
        labelEn: "Consultation: Weekly Strategy 4X Call",
        labelAr: "استشارات استراتيجية: 4 جلسات أسبوعية شهرياً",
        category: "management",
      },
    ],
  },
  {
    id: "enterprise",
    nameEn: "Enterprise",
    nameAr: "حلول الشركات والمؤسسات",
    taglineEn: "Talk to our team for pricing and additional features.",
    taglineAr: "تواصل مع فريق الإنتاج لدينا لتسعير باقات مخصصة وميزات موسعة.",
    monthlyPrice: null,
    yearlyPricePerMonth: null,
    ctaTextEn: "Contact Sales",
    ctaTextAr: "تواصل مع المبيعات",
    ctaType: "contact",
    specsHighlights: {
      reels: "Unlimited",
      posts: "Custom",
      stories: "Daily Live",
      filming: "Dedicated Crew",
    },
    features: [
      {
        labelEn: "Custom solutions for large businesses with advanced requirements, dedicated support, and scalable infrastructure tailored to your needs.",
        labelAr: "حلول إنتاجية متكاملة للمؤسسات الكبرى مع دعم مخصص، طواقم إخراج دائمة، وبنية تحتية قابلة للتوسع تلائم أهدافكم.",
        category: "management",
      },
      {
        labelEn: "Access to Soundstages, OB-VAN units, and XR Virtual Production stages",
        labelAr: "أولوية حجز للاستوديوهات، عربات البث الخارجي OB-VAN، واستوديوهات الواقع الافتراضي XR",
        category: "filming",
      },
      {
        labelEn: "Dedicated creative director, senior editors & 24/7 turnaround SLAs",
        labelAr: "مخرج إبداعي مخصص، كبار المونتيرين، واتفاقيات تسليم سريعة 24/7",
        category: "management",
      },
    ],
  },
];

export const PACKAGE_FAQS = [
  {
    questionEn: "What equipment and cameras are used for filming?",
    questionAr: "ما هي الكاميرات والمعدات المستخدمة في أيام التصوير؟",
    answerEn: "All social media filming sessions utilize our cinema production kit: Sony FX6 / FX3 cinema cameras, GM prime lenses, Aputure studio lighting, wireless Sennheiser audio, and calibrated DJI Ronin gimbals for buttery cinematic movement.",
    answerAr: "تُنفذ جميع جلسات التصوير باستخدام أحدث كاميرات السينما الرقمية Sony FX6 وFX3، عدسات GM السينمائية، إضاءات Aputure الاحترافية، ومايكات Sennheiser اللاسلكية مع مانعات اهتزاز DJI Ronin لضمان جودة استثنائية.",
  },
  {
    questionEn: "Can we shoot at our office or on-location instead of Yas Pro studios?",
    questionAr: "هل يمكن التصوير في مقر شركتنا بدلاً من استوديوهات Yas Pro؟",
    answerEn: "Yes! Your included visit days (Half Day or Full Day) can take place at our flagship Business Bay soundstages or on-location anywhere across Dubai, Abu Dhabi, or UAE with our mobile crew.",
    answerAr: "بالتأكيد! يمكن إجراء أيام التصوير المعتمدة (نصف يوم أو يوم كامل) في استوديوهاتنا بالخليج التجاري أو في موقع شركتكم وأي وجهة خارجية في دبي وأبوظبي وجميع إمارات الدولة.",
  },
  {
    questionEn: "How fast is the turnaround time for Reels and Posts?",
    questionAr: "كم تبلغ المدة الزمنية لتسليم الفيديوهات والمنشورات؟",
    answerEn: "First drafts are typically delivered within 48 to 72 hours following the filming session via our review portal. Fast-track rush turnaround is also available upon request.",
    answerAr: "يتم تسليم المسودات الأولى للفيديوهات خلال 48 إلى 72 ساعة بعد انتهاء جلسة التصوير عبر منصة المراجعة الرقمية، مع توفر خيار التسليم السريع للمحتوى الآني.",
  },
  {
    questionEn: "Do unused reels or filming hours roll over to the next month?",
    questionAr: "هل تُرحل ساعات التصوير أو الريلز غير المستخدمة إلى الشهر التالي؟",
    answerEn: "For Annual billing subscribers (-20% plan), up to 25% of filming hours can roll over into the adjacent month to accommodate seasonal campaigns and product launches.",
    answerAr: "لمشتركي الخطط السنوية (خصم 20%)، يمكن ترحيل ما يصل إلى 25% من ساعات التصوير والمنشورات إلى الشهر التالي لتغطية الفعاليات والمواسم التسويقية.",
  },
  {
    questionEn: "How does the annual discount work?",
    questionAr: "كيف يتم تطبيق خصم الاشتراك السنوي؟",
    answerEn: "When you select Yearly billing, you receive an immediate 20% discount on the monthly rate, billed annually. This gives you locked-in rates and priority soundstage scheduling all year.",
    answerAr: "عند اختيار الدفع السنوي، تحصل فوراً على خصم 20% على القيمة الشهرية (مع فوترة سنوية)، بالإضافة إلى تثبيت الأسعار وأولوية حجز الاستوديوهات على مدار العام.",
  },
];
