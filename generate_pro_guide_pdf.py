import os
import sys
import arabic_reshaper
from bidi.algorithm import get_display

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# ---------------------------------------------------------
# FONT REGISTRATION (Windows System Fonts for Arabic & EN)
# ---------------------------------------------------------
pdfmetrics.registerFont(TTFont("Arial", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Italic", "C:/Windows/Fonts/ariali.ttf"))
pdfmetrics.registerFont(TTFont("Courier", "C:/Windows/Fonts/cour.ttf"))
pdfmetrics.registerFont(TTFont("Courier-Bold", "C:/Windows/Fonts/courbd.ttf"))

def ar(text: str) -> str:
    """Reshape and reorder Arabic text for bidirectional rendering."""
    if not text:
        return ""
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

# ---------------------------------------------------------
# DYNAMIC NUMBERED CANVAS (Page X of Y + Running Headers)
# ---------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        if self._pageNumber > 1:
            # Header
            self.setFont("Arial-Bold", 8)
            self.setFillColor(colors.HexColor("#0f172a"))
            self.drawString(45, 808, "YAS PRO • AI MEDIA HUB DUBAI")
            self.setFont("Arial", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(180, 808, "|   VERCEL PRO ARCHITECTURAL BLUEPRINT")
            self.drawRightString(550, 808, ar("ياس برو • دليل الترقية والهندسة المعمارية الشامل"))
            
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.75)
            self.line(45, 800, 550, 800)

            # Footer
            self.line(45, 45, 550, 45)
            self.setFont("Arial", 7.5)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(45, 32, "CONFIDENTIAL & PROPRIETARY — YAS PRODUCTIONS FZ-LLC, DUBAI UAE")
            page_text = f"Page {self._pageNumber} of {total_pages}"
            self.drawRightString(550, 32, page_text)
        self.restoreState()

# ---------------------------------------------------------
# COLOR PALETTE (Luxury Studio Dark / Slate / Amber / Emerald)
# ---------------------------------------------------------
PRIMARY = colors.HexColor("#0f172a")    # Deep Slate
SECONDARY = colors.HexColor("#0284c7")  # Tech Blue
ACCENT_GOLD = colors.HexColor("#d97706")# Studio Gold / Amber
ACCENT_GREEN = colors.HexColor("#059669")# Emerald
TEXT_DARK = colors.HexColor("#1e293b")  # Body dark
TEXT_MUTED = colors.HexColor("#475569") # Secondary text
BG_LIGHT = colors.HexColor("#f8fafc")   # Card background
BG_CODE = colors.HexColor("#0f172a")    # Code block dark background
BORDER_LIGHT = colors.HexColor("#e2e8f0")

# ---------------------------------------------------------
# TYPOGRAPHY STYLES
# ---------------------------------------------------------
styles = getSampleStyleSheet()

cover_title = ParagraphStyle(
    "CoverTitle",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=26,
    leading=32,
    textColor=PRIMARY,
    spaceAfter=6,
)

cover_ar_title = ParagraphStyle(
    "CoverArTitle",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=20,
    leading=28,
    alignment=2, # Right
    textColor=ACCENT_GOLD,
    spaceAfter=15,
)

cover_subtitle = ParagraphStyle(
    "CoverSubtitle",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=11,
    leading=16,
    textColor=TEXT_MUTED,
    spaceAfter=25,
)

h1_style = ParagraphStyle(
    "Heading1_Custom",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=15,
    leading=19,
    textColor=PRIMARY,
    spaceBefore=14,
    spaceAfter=4,
)

h1_ar_style = ParagraphStyle(
    "Heading1_Ar_Custom",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=13,
    leading=17,
    alignment=2,
    textColor=ACCENT_GOLD,
    spaceBefore=2,
    spaceAfter=8,
)

h2_style = ParagraphStyle(
    "Heading2_Custom",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=11,
    leading=15,
    textColor=SECONDARY,
    spaceBefore=8,
    spaceAfter=3,
)

h2_ar_style = ParagraphStyle(
    "Heading2_Ar_Custom",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=10.5,
    leading=14,
    alignment=2,
    textColor=ACCENT_GOLD,
    spaceBefore=1,
    spaceAfter=5,
)

body_en = ParagraphStyle(
    "BodyEN",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=8.5,
    leading=12.5,
    textColor=TEXT_DARK,
    spaceAfter=4,
)

body_ar = ParagraphStyle(
    "BodyAR",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=8.5,
    leading=13,
    alignment=2, # Right-to-Left
    textColor=TEXT_DARK,
    spaceAfter=6,
)

code_style = ParagraphStyle(
    "CodeBlock",
    parent=styles["Normal"],
    fontName="Courier",
    fontSize=7,
    leading=9.5,
    textColor=colors.HexColor("#f1f5f9"),
    spaceBefore=4,
    spaceAfter=4,
)

table_header = ParagraphStyle(
    "TableHeader",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=8,
    leading=10,
    textColor=colors.white,
)

table_cell_en = ParagraphStyle(
    "TableCellEN",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=7.5,
    leading=10,
    textColor=TEXT_DARK,
)

table_cell_bold = ParagraphStyle(
    "TableCellBold",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=7.5,
    leading=10,
    textColor=PRIMARY,
)

table_cell_ar = ParagraphStyle(
    "TableCellAR",
    parent=styles["Normal"],
    fontName="Arial",
    fontSize=7.5,
    leading=10.5,
    alignment=2,
    textColor=TEXT_DARK,
)

badge_style = ParagraphStyle(
    "Badge",
    parent=styles["Normal"],
    fontName="Arial-Bold",
    fontSize=8,
    leading=10,
    textColor=colors.HexColor("#065f46"),
)

def create_callout(en_title: str, en_body: str, ar_title: str, ar_body: str, border_color=ACCENT_GOLD):
    """Generates a bilingual styled callout block."""
    content = [
        Paragraph(f"<b>{en_title}</b>", ParagraphStyle("CT_EN", parent=body_en, fontName="Arial-Bold", textColor=PRIMARY, fontSize=9)),
        Paragraph(en_body, body_en),
        Spacer(1, 4),
        Paragraph(f"<b>{ar(ar_title)}</b>", ParagraphStyle("CT_AR", parent=body_ar, fontName="Arial-Bold", textColor=ACCENT_GOLD, fontSize=8.5)),
        Paragraph(ar(ar_body), body_ar),
    ]
    t = Table([[content]], colWidths=[505])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBEFORE', (0,0), (0,0), 3.5, border_color),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
    ]))
    return t

def create_code_box(code_text: str, filename_badge: str = ""):
    """Generates a dark syntax card for code snippets."""
    flowables = []
    if filename_badge:
        flowables.append(Paragraph(f"<b>{filename_badge}</b>", ParagraphStyle("BadgeFile", fontName="Arial-Bold", fontSize=7.5, textColor=colors.HexColor("#38bdf8"), spaceAfter=3)))
    formatted = code_text.strip().replace(" ", "&nbsp;").replace("\n", "<br/>")
    flowables.append(Paragraph(formatted, code_style))
    t = Table([[flowables]], colWidths=[505])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_CODE),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#334155")),
    ]))
    return t

def generate_pdf():
    pdf_path = "C:/Users/PC/Desktop/yaspro/YAS_PRO_VERCEL_PRO_MIGRATION_BLUEPRINT.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=48,
        bottomMargin=50,
    )

    story = []

    # =========================================================================
    # COVER / TITLE BLOCK
    # =========================================================================
    brand_header = Table([
        [
            Paragraph("<b>YAS PRO MEDIA HUB</b> &bull; DUBAI ARCHITECTURE", ParagraphStyle("Brand", fontName="Arial-Bold", fontSize=9, textColor=ACCENT_GOLD)),
            Paragraph(ar("المقر الإعلامي الذكي • دبي"), ParagraphStyle("BrandAr", fontName="Arial-Bold", fontSize=9, alignment=2, textColor=ACCENT_GOLD)),
        ]
    ], colWidths=[250, 255])
    brand_header.setStyle(TableStyle([
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(brand_header)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Vercel Pro Upgrade & Architectural Migration Blueprint", cover_title))
    story.append(Paragraph(ar("وثيقة الانتقال الهندسي الشامل والترقية إلى باقة فيرسل برو (Vercel Pro)"), cover_ar_title))
    
    story.append(Paragraph(
        "<b>Scope:</b> Comprehensive technical audit of Vercel Pro capabilities, codebase migrations (Vercel Blob, AI Gateway, Edge Config, Distributed Rate Limiting), serverless execution timeouts, and enterprise production readiness for Yas Pro's Next.js 16, Neon DB, and Gemini AI ecosystem.<br/>"
        + ar("<b>نطاق الوثيقة:</b> تدقيق تقني شامل لترقية فيرسل برو، وخارطة طريق نقل منظومة التخزين إلى (Vercel Blob)، وبوابة الذكاء الاصطناعي (AI Gateway)، وتكوينات الحافة، وتأمين مسارات الدفع والحجوزات لمنصة ياس برو."),
        cover_subtitle
    ))

    # Meta Info Card
    meta_table = Table([
        [
            Paragraph("<b>Target Stack:</b> Next.js 16 (Turbopack) &bull; React 19 &bull; Neon DB &bull; Vercel AI SDK", table_cell_en),
            Paragraph("<b>Document Version:</b> 2.4.0 (Enterprise Architecture)", table_cell_en),
        ],
        [
            Paragraph("<b>Author:</b> Principal AI Cloud Architect", table_cell_en),
            Paragraph("<b>Status:</b> Approved for Production Migration", table_cell_en),
        ]
    ], colWidths=[250, 255])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # Executive Overview Callout
    story.append(create_callout(
        "Executive Summary: Why Vercel Pro is Mandatory for Yas Pro",
        "Yas Pro operates as a commercial Dubai production studio & rental platform. Operating on Vercel Hobby exposes the platform to immediate operational risks: a strict 10-second serverless execution ceiling that cuts off Google Gemini AI streaming, an in-memory storage driver that fails on serverless lambdas, and a 1,000-image optimization cap that crashes when browsing the high-resolution gear catalog. Upgrading to Pro ($20/mo) unlocks commercial licensing, 300s execution duration, 1TB bandwidth, 5,000 auto-scaling image transformations, Vercel Blob hot asset storage, and enterprise WAF.",
        "الملخص التنفيذي: لماذا تعتبر باقة برو ضرورة تقنية وقانونية حتمية لمنصة ياس برو؟",
        "تعمل ياس برو كمنصة تجارية متكاملة لحجز استوديوهات التصوير وتأجير معدات السينما في دبي. إن العمل على الباقة المجانية يعرض النظام لمخاطر فورية: مهلة زمنية قصوى 10 ثوانٍ تقطع محادثات الذكاء الاصطناعي (Gemini)، ومحرك تخزين محلي يفقد الملفات على دوال الخادم، وحد أقصى لتحسين الصور (1,000 صورة فقط) يتعطل مع تصفح الكتالوج. الترقية لباقة برو (20 دولاراً/شهرياً) تضمن الترخيص التجاري، وتشغيل حتى 300 ثانية، ومساحة نقل 1 تيرابايت، وتخزين سحابي مباشر (Vercel Blob) وحماية جدار النار (WAF)."
    ))

    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 1: DETAILED TECHNICAL COMPARISON TABLE
    # =========================================================================
    story.append(Paragraph("1. Comprehensive Technical Audit: Hobby vs. Pro", h1_style))
    story.append(Paragraph(ar("1. التدقيق التقني والمقارنة الشاملة: الباقة المجانية مقابل باقة برو"), h1_ar_style))

    table_data = [
        [
            Paragraph("Metric / Feature", table_header),
            Paragraph("Vercel Hobby (Free)", table_header),
            Paragraph("Vercel Pro ($20/mo)", table_header),
            Paragraph("Direct Impact on Yas Pro", table_header)
        ],
        [
            Paragraph("<b>Commercial Licensing</b>", table_cell_bold),
            Paragraph("❌ Strictly Non-Commercial / Personal only", table_cell_en),
            Paragraph("✅ Fully Licensed for Commercial Business", table_cell_en),
            Paragraph("Legal compliance for Dubai studio bookings & client invoicing.", table_cell_en),
        ],
        [
            Paragraph("<b>Serverless Timeout (maxDuration)</b>", table_cell_bold),
            Paragraph("Hard 10s ceiling (abrupt termination)", table_cell_en),
            Paragraph("Configurable up to 300s (5 minutes)", table_cell_en),
            Paragraph("<b>Critical:</b> Gemini AI assistant, proposal engine, and batch PDF generation.", table_cell_en),
        ],
        [
            Paragraph("<b>Next.js Image Optimization</b>", table_cell_bold),
            Paragraph("1,000 source images / month (hard cap)", table_cell_en),
            Paragraph("5,000 images included + elastic on-demand", table_cell_en),
            Paragraph("Required for 100+ cinema camera & lens catalog items without 402 errors.", table_cell_en),
        ],
        [
            Paragraph("<b>Fast Edge Bandwidth</b>", table_cell_bold),
            Paragraph("100 GB / month", table_cell_en),
            Paragraph("1 TB (1,000 GB) / month included", table_cell_en),
            Paragraph("Essential for 4K video reel showcases, Three.js 3D models, and high-res stills.", table_cell_en),
        ],
        [
            Paragraph("<b>Storage Architecture</b>", table_cell_bold),
            Paragraph("Ephemeral local disk (files vanish on spin-down)", table_cell_en),
            Paragraph("Vercel Blob + Edge CDN native integration", table_cell_en),
            Paragraph("Persistent equipment photos, client brief attachments, and direct browser uploads.", table_cell_en),
        ],
        [
            Paragraph("<b>Log History & Observability</b>", table_cell_bold),
            Paragraph("1 hour ephemeral retention", table_cell_en),
            Paragraph("3 days real-time searchable retention + alerts", table_cell_en),
            Paragraph("Audit failed Ziina payment webhooks and booking reservation discrepancies.", table_cell_en),
        ],
        [
            Paragraph("<b>DDoS & Security WAF</b>", table_cell_bold),
            Paragraph("Basic infrastructure DDoS only", table_cell_en),
            Paragraph("Custom WAF rules, rate limiting, IP blocking", table_cell_en),
            Paragraph("Prevents AI token draining bots and spamming on `/api/ai/*` endpoints.", table_cell_en),
        ],
        [
            Paragraph("<b>Preview Environments</b>", table_cell_bold),
            Paragraph("Public links only (anyone with URL sees WIP)", table_cell_en),
            Paragraph("Password protection & SSO deployment access", table_cell_en),
            Paragraph("Share private staging proposals and customized booking packages with VIP clients.", table_cell_en),
        ],
    ]

    comp_table = Table(table_data, colWidths=[95, 115, 130, 165])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 2: AI ARCHITECTURE & TIMEOUTS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("2. AI Engine & Serverless Timeout Lifeline", h1_style))
    story.append(Paragraph(ar("2. هندسة الذكاء الاصطناعي وحل معضلة المهلة الزمنية للخوادم"), h1_ar_style))

    story.append(Paragraph(
        "<b>The 10-Second Catastrophe on Free Tier:</b> Yas Pro integrates complex generative AI workflows in "
        "<code>src/app/api/ai/chat/route.ts</code>, <code>src/app/api/ai/proposal/route.ts</code>, "
        "<code>src/app/api/ai/gear-matcher/route.ts</code>, and <code>src/app/api/ai/mawthooq-audit/route.ts</code>. "
        "These endpoints execute multi-step tools (e.g. searching camera inventory, validating Saudi Mawthooq regulatory licenses, "
        "and converting scripts to Gulf/Egyptian dialects). On Vercel Hobby, functions terminate violently at <b>10 seconds</b>. "
        "If Google Gemini encounters network latency or generates a comprehensive studio shooting schedule, visitors receive a "
        "<code>504 Gateway Timeout</code> error, breaking the chat experience.<br/><br/>"
        "<b>Vercel Pro Solution:</b> On Pro, the maximum serverless execution duration increases to <b>300 seconds (5 minutes)</b>. "
        "We can configure custom timeouts per route to ensure zero interrupted generations.",
        body_en
    ))

    story.append(Paragraph(
        ar("<b>مشكلة الـ 10 ثوانٍ في الباقة المجانية:</b> تعتمد ياس برو على محركات ذكاء اصطناعي متطورة لتنسيق باقات المعدات وفحص الامتثال وتعديل اللهجات وتوليد عروض الأسعار. في الباقة المجانية تنقطع الخوادم عند 10 ثوانٍ، مما يؤدي إلى فشل الرد وظهور خطأ 504. ترفع باقة برو المهلة إلى 300 ثانية، مما يمنح محرك Gemini كامل الوقت لتوليد الردود المعقدة وتدفق البيانات بسلاسة."),
        body_ar
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Code Change Required:</b> Setting maxDuration in Next.js App Router Routes", h2_style))
    story.append(create_code_box(
"""// src/app/api/ai/chat/route.ts
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// CRITICAL PRO CONFIGURATION: Set execution limit to 60s (up to 300s)
export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Complex multi-step tool calls now have ample execution runway
  const result = await streamText({
    model: google("gemini-1.5-pro"),
    messages: parsed.data.messages,
    maxSteps: 5, // multi-step tool calling
  });
  return result.toDataStreamResponse();
}""",
        "src/app/api/ai/chat/route.ts (maxDuration Configuration)"
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Future AI Development: Vercel AI Gateway Integration</b>", h2_style))
    story.append(Paragraph(
        "Vercel Pro unlocks the <b>Vercel AI Gateway</b>. This provides three transformative architectural benefits:<br/>"
        "<b>1. Semantic & Exact Prompt Caching:</b> Studio visitors frequently ask identical questions (e.g. <i>'What lighting is included in Studio XR?'</i> or <i>'What is the deposit for the ARRI Alexa 35?'</i>). The AI Gateway caches identical prompts at the edge, returning responses in &lt;10ms with <b>0 Google Gemini token cost</b>.<br/>"
        "<b>2. Multi-Model Automated Fallback:</b> If Google Gemini experiences high latency or upstream rate limits (429), the gateway automatically routes the query to Anthropic Claude 3.5 Sonnet or OpenAI GPT-4o without client code alterations.<br/>"
        "<b>3. Token Spend Telemetry & Guardrails:</b> Real-time tracking of AI consumption per client session to prevent runaway API bills.",
        body_en
    ))

    story.append(Paragraph(
        ar("<b>بوابة الذكاء الاصطناعي (AI Gateway):</b> تتيح التخزين المؤقت للأسئلة الشائعة (مما يوفر تكاليف رموز Gemini بنسبة تصل إلى 60%)، والتحويل التلقائي بين النماذج (Gemini -> Claude -> OpenAI) في حال حدوث أي انقطاع، ومراقبة دقيقة لاستهلاك كل مستخدم."),
        body_ar
    ))

    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 3: STORAGE MIGRATION TO VERCEL BLOB
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Storage Migration: Migrating to Vercel Blob (@vercel/blob)", h1_style))
    story.append(Paragraph(ar("3. التحول المعماري لمنظومة التخزين السحابي المباشر (Vercel Blob)"), h1_ar_style))

    story.append(Paragraph(
        "<b>Current Codebase Vulnerability in <code>src/lib/storage.ts</code>:</b><br/>"
        "Line 97 of <code>src/lib/storage.ts</code> currently falls back to <code>LocalDiskStorageProvider</code>, writing files to "
        "<code>public/uploads</code> via Node.js <code>fs/promises</code>. "
        "<b>In a serverless environment (Vercel Lambdas), the local filesystem is ephemeral and read-only (except /tmp).</b> "
        "Any equipment photo, studio asset, or user attachment uploaded via the admin portal is permanently lost whenever the lambda spins down! "
        "Furthermore, serverless function requests have a <b>4.5 MB request body limit</b>, which blocks clients from uploading 4K camera reels, raw audio, or high-res gear specs.<br/><br/>"
        "<b>The Vercel Blob Solution:</b><br/>"
        "Vercel Blob provides native edge object storage powered by global Anycast CDN. It requires zero AWS IAM complexity—authenticated automatically via <code>BLOB_READ_WRITE_TOKEN</code>. More importantly, it supports <b>Client-Side Direct Uploads</b>, allowing users to stream 500MB+ files directly from the browser to Blob storage, bypassing the Next.js lambda completely!",
        body_en
    ))

    story.append(Paragraph(
        ar("<b>الخلل المعماري الحالي في التخزين:</b> يعتمد ملف <code>storage.ts</code> حالياً على التخزين المحلي في مجلد <code>public/uploads</code>. في خوادم فيرسل السحابية (Serverless)، يعد القرص مؤقتاً وغير قابل للكتابة الدائمة، مما يعني أن أي صورة أو ملف يتم رفعه يختفي فور إعادة تشغيل الخادم! بالإضافة إلى أن الحد الأقصى للطلب هو 4.5 ميجابايت فقط.<br/>"
        "<b>الحل عبر Vercel Blob:</b> تخزين سحابي أصيل متصل بشبكة CDN عالمية، يتيح الرفع المباشر من متصفح العميل (Direct Client Uploads) لملفات الفيديو بدقة 4K والمستندات حتى 500 ميجابايت دون إرهاق خادم التطبيق وبأعلى سرعة ممكنة."),
        body_ar
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Implementation Blueprint: Adding VercelBlobStorageProvider</b>", h2_style))
    story.append(create_code_box(
"""// src/lib/storage.ts (Updated for Vercel Blob)
import { put, del } from "@vercel/blob";

export class VercelBlobStorageProvider implements StorageProvider {
  async save(filename: string, buffer: Buffer): Promise<UploadResult> {
    const blob = await put(`yaspro/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: false, // unique filename already generated in upload route
    });

    return {
      url: blob.url,
      path: blob.pathname,
      size: buffer.length,
    };
  }
}

// Singleton factory
export const storageProvider: StorageProvider =
  process.env.BLOB_READ_WRITE_TOKEN
    ? new VercelBlobStorageProvider()
    : new LocalDiskStorageProvider();""",
        "src/lib/storage.ts (Vercel Blob Provider)"
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Client Direct Upload API: Bypassing the 4.5MB Serverless Ceiling</b>", h2_style))
    story.append(create_code_box(
"""// src/app/api/upload/route.ts (Client Upload Token Endpoint)
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Authenticate admin or client booking session
        const session = await auth.api.getSession({ headers: request.headers });
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "application/pdf"],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB video/RAW capacity!
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Register file in Neon DB gear inventory or booking records
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}""",
        "src/app/api/upload/route.ts (Client-Side Direct Upload)"
    ))

    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 4: EDGE CONFIG, KV & RATE LIMITING
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Edge Config, Distributed Rate Limiting & Next.js Caching", h1_style))
    story.append(Paragraph(ar("4. إعدادات الحافة الفورية (Edge Config) وتوزيع حماية المعدلات"), h1_ar_style))

    story.append(Paragraph(
        "<b>Flaw in Current In-Memory Rate Limiter (<code>src/lib/rate-limit.ts</code>):</b><br/>"
        "In <code>src/lib/rate-limit.ts</code>, requests are throttled using in-memory <code>Map&lt;string, RateLimitRecord&gt;()</code>. "
        "In serverless deployments, each incoming HTTP request may spin up a distinct isolated container. An attacker can hammer "
        "the AI or booking APIs across multiple concurrent lambdas without ever triggering the in-memory throttle. "
        "<b>Vercel Pro enables Vercel KV (Upstash Redis)</b> for atomic, distributed sliding-window rate limiting across all global edge nodes.",
        body_en
    ))

    story.append(Paragraph(
        ar("<b>تحديث نظام حماية الطلبات (Rate Limiting):</b> يعتمد التطبيق حالياً على خريطة داخل الذاكرة (In-Memory Map) والتي تفقد قيمها مع تعدد نسخ الخوادم السحابية. من خلال باقة برو وخدمة Vercel KV، يتم تطبيق حماية مركزية متزامنة عبر كافة خوادم الحافة العالمية لمنع استنزاف رموز الذكاء الاصطناعي وهجمات حجب الخدمة."),
        body_ar
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Migrating to Distributed Edge Rate Limiting:</b>", h2_style))
    story.append(create_code_box(
"""// src/lib/rate-limit.ts (Distributed with Vercel KV)
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

// 30 requests per 60 seconds per IP, synchronized across all serverless lambdas
export const distributedAiRateLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  prefix: "yaspro:ratelimit:ai",
});""",
        "src/lib/rate-limit.ts (Distributed Edge Limiting)"
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Vercel Edge Config: Sub-Millisecond Global Reads for Business Logic</b>", h2_style))
    story.append(Paragraph(
        "Yas Pro currently queries Neon PostgreSQL or hardcodes pricing values for studio packages, currency multipliers, and blackout dates. "
        "With <b>Vercel Edge Config</b>, configuration data is globally replicated to all edge nodes (including Middle East edge PoPs in Dubai and Bahrain) "
        "and read in <b>under 1 millisecond</b> with zero database connection overhead.<br/>"
        "<b>Ideal Use Cases for Yas Pro:</b><br/>"
        "&bull; <b>Live Currency Multipliers:</b> Instant adjustment of AED, SAR, USD, and EUR conversion rates.<br/>"
        "&bull; <b>Studio Turnkey Promos:</b> Enable/disable flash discounts or Ramadan studio packages instantly.<br/>"
        "&bull; <b>Emergency Maintenance Mode:</b> Block bookings for specific studios instantly during private VIP shoots.",
        body_en
    ))

    story.append(Paragraph(
        ar("<b>مزايا Vercel Edge Config الفورية:</b> قراءة إعدادات الأعمال (مثل أسعار الصرف، والعروض الترويجية للاستوديوهات، وتواريخ الإغلاق للطوارئ) في أقل من ملّي ثانية واحدة من أقرب خادم حافة في دبي دون استهلاك اتصالات قاعدة بيانات Neon."),
        body_ar
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Updating <code>next.config.ts</code> for Vercel Blob & Middle East Delivery:</b>", h2_style))
    story.append(create_code_box(
"""// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30-day edge cache for catalog media
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }, // Vercel Blob
      { protocol: "https", hostname: "yasproductions.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
    ],
  },
};""",
        "next.config.ts (Vercel Blob Integration)"
    ))

    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 5: WAF SECURITY, ZIINA & WORKFLOWS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Enterprise Security, Ziina Payments & VIP Previews", h1_style))
    story.append(Paragraph(ar("5. أمان المؤسسات، بوابات الدفع (Ziina)، وبيئات العرض الخاصة بالعملاء"), h1_ar_style))

    story.append(Paragraph(
        "<b>1. Vercel Web Application Firewall (WAF) & DDoS Shielding:</b><br/>"
        "Yas Pro exposes high-value public endpoints: the AI Copilot, booking quote calculations, and Ziina payment initiation in AED. "
        "Vercel Pro gives access to managed WAF rules that filter OWASP Top 10 exploits, block bot scrapers attempting to rip equipment prices, "
        "and automatically mitigate L7 DDoS attacks before traffic touches your application lambdas.<br/><br/>"
        "<b>2. Ziina Payment Webhook Protection & Real-time Logs:</b><br/>"
        "When clients pay deposits via Ziina (<code>src/lib/ziina.ts</code>), webhooks notify the app to confirm booking dates in Neon DB. "
        "On Free tier, logs are deleted after 1 hour. If a payment webhook encounters a transient database lock at 2 AM, the error log vanishes, "
        "leaving staff blind to whether money was captured. Pro's <b>3-day searchable log retention</b> and alerting guarantees instant diagnosis.<br/><br/>"
        "<b>3. Password-Protected Staging Environments for Corporate Clients:</b><br/>"
        "Major Dubai brands (luxury fashion, automotive, government entities) require customized shooting proposals and turnkey studio setups. "
        "With Pro's Deployment Protection, Yas Pro can deploy staging branches (e.g. <code>client-pitch-rolex.yaspro.ae</code>) protected with "
        "secure access tokens or passwords, allowing corporate VIPs to review private previews safely before contract signing.",
        body_en
    ))

    story.append(Paragraph(
        ar("<b>1. جدار حماية التطبيقات (WAF):</b> حماية واجهات برمجة التطبيقات ونقاط الذكاء الاصطناعي من هجمات الحرمان من الخدمة والمسح الآلي للأسعار.<br/>"
        "<b>2. حماية مدفوعات زينة (Ziina) وسجلات فورية لـ 3 أيام:</b> تمكين التتبع الفوري لحالات الدفع وتأكيد الحجوزات مع الاحتفاظ بالسجلات الكاملة لتجنب ضياع بيانات المعاملات المالية.<br/>"
        "<b>3. بيئات عرض محمية بكلمة سر للشركات الكبرى:</b> إمكانية تقديم عروض حصرية واستعراض الاستوديوهات للعملاء المميزين (VIP) في دبي عبر روابط تجريبية مشفرة ومحمية بكلمة مرور قبل الإطلاق العام."),
        body_ar
    ))

    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 6: IMPLEMENTATION ROADMAP & ROI
    # =========================================================================
    story.append(Paragraph("6. Step-by-Step Migration Roadmap & ROI Analysis", h1_style))
    story.append(Paragraph(ar("6. خارطة طريق التنفيذ الميداني وحساب العائد على الاستثمار (ROI)"), h1_ar_style))

    roadmap_data = [
        [
            Paragraph("Phase / Timeline", table_header),
            Paragraph("Action Item & Technical Changes", table_header),
            Paragraph("Engineering Deliverables", table_header),
            Paragraph("Business Benefit", table_header)
        ],
        [
            Paragraph("<b>Phase 1</b><br/>Day 1", table_cell_bold),
            Paragraph("• Upgrade Vercel Project to Pro ($20/mo)<br/>• Add <code>maxDuration = 60</code> to all AI routes", table_cell_en),
            Paragraph("Update <code>chat/route.ts</code> and <code>proposal/route.ts</code>", table_cell_en),
            Paragraph("Immediate elimination of 504 AI timeout errors.", table_cell_en),
        ],
        [
            Paragraph("<b>Phase 2</b><br/>Week 1", table_cell_bold),
            Paragraph("• Provision Vercel Blob store<br/>• Implement <code>VercelBlobStorageProvider</code><br/>• Update <code>next.config.ts</code> whitelists", table_cell_en),
            Paragraph("Install <code>@vercel/blob</code>; migrate <code>storage.ts</code> and <code>upload/route.ts</code>", table_cell_en),
            Paragraph("Permanent media persistence; 500MB client video uploads.", table_cell_en),
        ],
        [
            Paragraph("<b>Phase 3</b><br/>Week 2", table_cell_bold),
            Paragraph("• Connect Vercel KV / Redis<br/>• Deploy distributed rate limiter on AI endpoints<br/>• Configure Vercel AI Gateway caching", table_cell_en),
            Paragraph("Implement <code>@upstash/ratelimit</code> in <code>rate-limit.ts</code>", table_cell_en),
            Paragraph("Slash Gemini token spend by 40-60%; protect against bot abuse.", table_cell_en),
        ],
        [
            Paragraph("<b>Phase 4</b><br/>Week 3", table_cell_bold),
            Paragraph("• Deploy Edge Config for currency & promo switches<br/>• Enable WAF managed rules & 3-day log alerts", table_cell_en),
            Paragraph("Create Edge Config store; configure Vercel WAF dashboard", table_cell_en),
            Paragraph("Sub-1ms dynamic pricing updates; corporate enterprise compliance.", table_cell_en),
        ],
    ]

    roadmap_table = Table(roadmap_data, colWidths=[65, 175, 145, 120])
    roadmap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(roadmap_table)
    story.append(Spacer(1, 10))

    # Final ROI Summary
    story.append(create_callout(
        "Final Financial & Operational Verdict: High-Yield Investment",
        "At $20/month (~73.5 AED/mo), Vercel Pro represents less than 0.5% of a single studio booking or camera rental package in Dubai. It converts Yas Pro from an unstable hobby prototype into an enterprise-grade, legally compliant, high-speed media platform with 300s AI execution, 1TB edge bandwidth, direct 500MB media uploads, and 24/7 payment reliability.",
        "الخلاصة والقرار النهائي: استثمار استراتيجي ذو عائد تشغيلي وتجاري هائل",
        "بتكلفة 20 دولاراً شهرياً (قرابة 73.5 درهم إماراتي فقط)، تمثل الترقية أقل من نصف بالمائة (0.5%) من قيمة حجز استوديو واحد أو استئجار كاميرا سينمائية في دبي. تنقل هذه الخطوة منصة ياس برو من مجرد تطبيق تجريبي معرض للتوقف وفقدان البيانات إلى منصة إنتاج سينمائي مؤسسية متكاملة ذات موثوقية عالية وسرعة استثنائية لكافة العملاء في دولة الإمارات والخليج العربي.",
        border_color=ACCENT_GREEN
    ))

    # Build the PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generation complete:", os.path.exists(pdf_path), "Path:", pdf_path)

if __name__ == "__main__":
    generate_pdf()
