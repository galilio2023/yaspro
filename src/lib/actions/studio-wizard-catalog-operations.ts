"use server";

import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  SESSION_TYPES,
  CREW_EQUIPMENT_ITEMS,
  PROPS_ITEMS,
  ADDONS_ITEMS,
} from "@/features/booking/constants";
import type {
  SessionTypeItem,
  CrewEquipmentItem,
  PropItem,
  AddonItem,
} from "@/features/booking/types";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

const CATALOG_KEY = "studio_wizard_catalog";

export interface StudioWizardCatalog {
  sessionTypes: SessionTypeItem[];
  crewEquipment: CrewEquipmentItem[];
  props: PropItem[];
  addons: AddonItem[];
}

function getDefaultCatalog(): StudioWizardCatalog {
  return {
    sessionTypes: [...SESSION_TYPES],
    crewEquipment: [...CREW_EQUIPMENT_ITEMS],
    props: [...PROPS_ITEMS],
    addons: [...ADDONS_ITEMS],
  };
}

/**
 * Loads the Studio Booking Wizard catalog (Step 2 Session Types, Step 4 Crew/Equipment,
 * Step 5 Props, Step 6 Post-Production Add-ons) from the database with fallback to defaults.
 */
export async function getStudioWizardCatalog(): Promise<StudioWizardCatalog> {
  const defaults = getDefaultCatalog();
  if (!isDbAvailable()) {
    return defaults;
  }

  try {
    const rows = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, CATALOG_KEY))
      .limit(1);

    if (rows.length > 0 && rows[0].value && typeof rows[0].value === "object") {
      const saved = rows[0].value as Partial<StudioWizardCatalog>;
      const sessionTypeDefaults = new Map(defaults.sessionTypes.map((item) => [item.id, item]));
      const crewDefaults = new Map(defaults.crewEquipment.map((item) => [item.id, item]));
      const propDefaults = new Map(defaults.props.map((item) => [item.id, item]));
      const addonDefaults = new Map(defaults.addons.map((item) => [item.id, item]));

      return {
        sessionTypes: Array.isArray(saved.sessionTypes) && saved.sessionTypes.length > 0
          ? saved.sessionTypes.map((item) => {
              const fallback = sessionTypeDefaults.get(item.id);
              return {
                ...item,
                titleAr: item.titleAr || fallback?.titleAr,
                labelAr: item.labelAr || item.titleAr || fallback?.labelAr || fallback?.titleAr,
                descriptionAr: item.descriptionAr || fallback?.descriptionAr,
                descAr: item.descAr || item.descriptionAr || fallback?.descAr || fallback?.descriptionAr,
              };
            })
          : defaults.sessionTypes,
        crewEquipment: Array.isArray(saved.crewEquipment)
          ? saved.crewEquipment.map((item) => {
              const fallback = crewDefaults.get(item.id);
              return {
                ...item,
                titleAr: item.titleAr || fallback?.titleAr,
                descriptionAr: item.descriptionAr || fallback?.descriptionAr,
              };
            })
          : defaults.crewEquipment,
        props: Array.isArray(saved.props)
          ? saved.props.map((item) => {
              const fallback = propDefaults.get(item.id);
              return {
                ...item,
                titleAr: item.titleAr || fallback?.titleAr,
                categoryAr: item.categoryAr || fallback?.categoryAr,
              };
            })
          : defaults.props,
        addons: Array.isArray(saved.addons)
          ? saved.addons.map((item) => {
              const fallback = addonDefaults.get(item.id);
              return {
                ...item,
                titleAr: item.titleAr || fallback?.titleAr,
                descriptionAr: item.descriptionAr || fallback?.descriptionAr,
              };
            })
          : defaults.addons,
      };
    }
  } catch (err) {
    console.warn("[studio-wizard-catalog] Falling back to static defaults:", (err as Error)?.message);
  }

  return defaults;
}

// Mutations must never save fallback data after a failed or invalid read.
async function loadStudioWizardCatalogStrict(): Promise<StudioWizardCatalog> {
  const [row] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, CATALOG_KEY))
    .limit(1);
  if (!row) return getDefaultCatalog();

  const saved = row.value as Partial<StudioWizardCatalog> | null;
  if (!saved || !Array.isArray(saved.sessionTypes) || !Array.isArray(saved.crewEquipment)
    || !Array.isArray(saved.props) || !Array.isArray(saved.addons)) {
    throw new Error("Saved studio wizard catalog is invalid.");
  }
  return saved as StudioWizardCatalog;
}

async function saveStudioWizardCatalog(catalog: StudioWizardCatalog): Promise<void> {
  await db
    .insert(platformSettings)
    .values({
      key: CATALOG_KEY,
      value: catalog,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: platformSettings.key,
      set: {
        value: catalog,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/studios");
  revalidatePath("/studio-booking");
}

// ─── Zod Validation Schemas ───────────────────────────────────────────────────

import { z } from "zod";

const finiteNonNegativePrice = (fieldLabel: string) =>
  z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || typeof val === "boolean"
        ? Number.NaN
        : Number(val),
    z
      .number({ message: `${fieldLabel} must be a valid finite number.` })
      .finite(`${fieldLabel} must be a finite number.`)
      .nonnegative(`${fieldLabel} cannot be negative.`)
  );

const studioSessionTypeInputSchema = z.object({
  id: z.string({ message: "Session ID is required." }).trim().min(1, "Session ID is required."),
  title: z.string({ message: "Session title is required." }).trim().min(1, "Session title is required."),
  titleAr: z.string().optional().default(""),
  description: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  price: finiteNonNegativePrice("Session price"),
  imageUrl: z.string().optional().default(""),
});

const studioCrewItemInputSchema = z.object({
  id: z.string({ message: "Crew/Equipment ID is required." }).trim().min(1, "Crew/Equipment ID is required."),
  title: z.string({ message: "Crew/Equipment title is required." }).trim().min(1, "Crew/Equipment title is required."),
  titleAr: z.string().optional().default(""),
  description: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  price: finiteNonNegativePrice("Crew/Equipment rate"),
  priceType: z.enum(["hourly", "flat"]).optional().default("hourly"),
  category: z.enum(["crew", "equipment"]).optional().default("crew"),
  imageUrl: z.string().optional().default(""),
});

const studioPropItemInputSchema = z.object({
  id: z.string({ message: "Prop ID is required." }).trim().min(1, "Prop ID is required."),
  title: z.string({ message: "Prop title is required." }).trim().min(1, "Prop title is required."),
  titleAr: z.string().optional().default(""),
  price: finiteNonNegativePrice("Prop rate"),
  priceType: z.enum(["hourly", "flat"]).optional().default("flat"),
  category: z.string().optional().default("Furniture"),
  categoryAr: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
});

const studioAddonItemInputSchema = z.object({
  id: z.string({ message: "Add-on ID is required." }).trim().min(1, "Add-on ID is required."),
  title: z.string({ message: "Add-on title is required." }).trim().min(1, "Add-on title is required."),
  titleAr: z.string().optional().default(""),
  description: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  price: finiteNonNegativePrice("Add-on rate"),
  priceType: z.enum(["hourly", "flat"]).optional().default("flat"),
  imageUrl: z.string().optional().default(""),
});

// ─── Session Types (Step 2) ───────────────────────────────────────────────────

export async function upsertStudioSessionType(
  item: SessionTypeItem
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const parsed = studioSessionTypeInputSchema.safeParse(item);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Valid session ID, title, and price are required.",
      };
    }
    const { id: cleanId, title: cleanTitle, titleAr, description, descriptionAr, price, imageUrl } = parsed.data;

    const current = await loadStudioWizardCatalogStrict();
    const existing = current.sessionTypes.find((s) => s.id === cleanId);
    const normalized: SessionTypeItem = {
      id: cleanId,
      title: cleanTitle,
      titleAr: titleAr.trim() || existing?.titleAr,
      label: cleanTitle,
      labelAr: titleAr.trim() || existing?.labelAr || existing?.titleAr,
      description: description.trim(),
      descriptionAr: descriptionAr.trim() || existing?.descriptionAr,
      desc: description.trim(),
      descAr: descriptionAr.trim() || existing?.descAr || existing?.descriptionAr,
      price,
      imageUrl: imageUrl.trim() || "/images/studios/nature-grid.jpg",
    };

    const idx = current.sessionTypes.findIndex((s) => s.id === cleanId);
    const updatedList = [...current.sessionTypes];
    if (idx >= 0) {
      updatedList[idx] = normalized;
    } else {
      updatedList.push(normalized);
    }

    const updated: StudioWizardCatalog = { ...current, sessionTypes: updatedList };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: `Session format "${cleanTitle}" saved.` };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to save session format." };
  }
}

export async function deleteStudioSessionType(
  id: string
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const current = await loadStudioWizardCatalogStrict();
    if (current.sessionTypes.length <= 1) {
      return { success: false, error: "At least one session format must remain active." };
    }
    const updated: StudioWizardCatalog = {
      ...current,
      sessionTypes: current.sessionTypes.filter((s) => s.id !== id),
    };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: "Session format removed." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to delete session format." };
  }
}

// ─── Crew & Equipment (Step 4) ────────────────────────────────────────────────

export async function upsertStudioCrewItem(
  item: CrewEquipmentItem
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const parsed = studioCrewItemInputSchema.safeParse(item);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Valid crew item ID, title, and rate are required.",
      };
    }
    const { id: cleanId, title: cleanTitle, titleAr, description, descriptionAr, price, priceType, category, imageUrl } = parsed.data;

    const current = await loadStudioWizardCatalogStrict();
    const existing = current.crewEquipment.find((c) => c.id === cleanId);
    const normalized: CrewEquipmentItem = {
      id: cleanId,
      title: cleanTitle,
      titleAr: titleAr.trim() || existing?.titleAr,
      description: description.trim(),
      descriptionAr: descriptionAr.trim() || existing?.descriptionAr,
      price,
      priceType,
      category,
      imageUrl: imageUrl.trim() || "/images/studios/nature-grid.jpg",
    };

    const idx = current.crewEquipment.findIndex((c) => c.id === cleanId);
    const updatedList = [...current.crewEquipment];
    if (idx >= 0) {
      updatedList[idx] = normalized;
    } else {
      updatedList.push(normalized);
    }

    const updated: StudioWizardCatalog = { ...current, crewEquipment: updatedList };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: `Crew/Equipment item "${cleanTitle}" saved.` };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to save crew item." };
  }
}

export async function deleteStudioCrewItem(
  id: string
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const current = await loadStudioWizardCatalogStrict();
    const updated: StudioWizardCatalog = {
      ...current,
      crewEquipment: current.crewEquipment.filter((c) => c.id !== id),
    };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: "Crew/Equipment item removed." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to delete crew item." };
  }
}

// ─── Props Vault (Step 5) ─────────────────────────────────────────────────────

export async function upsertStudioPropItem(
  item: PropItem
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const parsed = studioPropItemInputSchema.safeParse(item);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Valid prop ID, title, and rate are required.",
      };
    }
    const { id: cleanId, title: cleanTitle, titleAr, price, priceType, category, categoryAr, imageUrl } = parsed.data;

    const current = await loadStudioWizardCatalogStrict();
    const existing = current.props.find((p) => p.id === cleanId);
    const normalized: PropItem = {
      id: cleanId,
      title: cleanTitle,
      titleAr: titleAr.trim() || existing?.titleAr,
      price,
      priceType,
      category: category.trim() || "Furniture",
      categoryAr: categoryAr.trim() || existing?.categoryAr,
      imageUrl: imageUrl.trim() || "/images/studios/nature-grid.jpg",
    };

    const idx = current.props.findIndex((p) => p.id === cleanId);
    const updatedList = [...current.props];
    if (idx >= 0) {
      updatedList[idx] = normalized;
    } else {
      updatedList.push(normalized);
    }

    const updated: StudioWizardCatalog = { ...current, props: updatedList };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: `Prop "${cleanTitle}" saved.` };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to save prop." };
  }
}

export async function deleteStudioPropItem(
  id: string
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const current = await loadStudioWizardCatalogStrict();
    const updated: StudioWizardCatalog = {
      ...current,
      props: current.props.filter((p) => p.id !== id),
    };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: "Prop removed." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to delete prop." };
  }
}

// ─── Post-Production Add-ons (Step 6) ─────────────────────────────────────────

export async function upsertStudioAddonItem(
  item: AddonItem
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const parsed = studioAddonItemInputSchema.safeParse(item);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Valid add-on ID, title, and rate are required.",
      };
    }
    const { id: cleanId, title: cleanTitle, titleAr, description, descriptionAr, price, priceType, imageUrl } = parsed.data;

    const current = await loadStudioWizardCatalogStrict();
    const existing = current.addons.find((a) => a.id === cleanId);
    const normalized: AddonItem = {
      id: cleanId,
      title: cleanTitle,
      titleAr: titleAr.trim() || existing?.titleAr,
      description: description.trim(),
      descriptionAr: descriptionAr.trim() || existing?.descriptionAr,
      price,
      priceType,
      imageUrl: imageUrl.trim() || "/images/studios/nature-grid.jpg",
    };

    const idx = current.addons.findIndex((a) => a.id === cleanId);
    const updatedList = [...current.addons];
    if (idx >= 0) {
      updatedList[idx] = normalized;
    } else {
      updatedList.push(normalized);
    }

    const updated: StudioWizardCatalog = { ...current, addons: updatedList };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: `Add-on "${cleanTitle}" saved.` };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to save add-on." };
  }
}

export async function deleteStudioAddonItem(
  id: string
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const current = await loadStudioWizardCatalogStrict();
    const updated: StudioWizardCatalog = {
      ...current,
      addons: current.addons.filter((a) => a.id !== id),
    };
    await saveStudioWizardCatalog(updated);
    return { success: true, data: updated, message: "Add-on removed." };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to delete add-on." };
  }
}
