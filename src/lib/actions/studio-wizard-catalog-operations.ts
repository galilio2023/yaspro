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
      return {
        sessionTypes: Array.isArray(saved.sessionTypes) && saved.sessionTypes.length > 0
          ? saved.sessionTypes
          : defaults.sessionTypes,
        crewEquipment: Array.isArray(saved.crewEquipment)
          ? saved.crewEquipment
          : defaults.crewEquipment,
        props: Array.isArray(saved.props)
          ? saved.props
          : defaults.props,
        addons: Array.isArray(saved.addons)
          ? saved.addons
          : defaults.addons,
      };
    }
  } catch (err) {
    console.warn("[studio-wizard-catalog] Falling back to static defaults:", (err as Error)?.message);
  }

  return defaults;
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

// ─── Session Types (Step 2) ───────────────────────────────────────────────────

export async function upsertStudioSessionType(
  item: SessionTypeItem
): Promise<CmsResponse<StudioWizardCatalog>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database is not connected." };
    }
    const cleanId = item.id.trim();
    const cleanTitle = item.title.trim();
    if (!cleanId || !cleanTitle || Number(item.price) < 0) {
      return { success: false, error: "Valid session ID, title, and price are required." };
    }

    const current = await getStudioWizardCatalog();
    const normalized: SessionTypeItem = {
      id: cleanId,
      title: cleanTitle,
      description: item.description?.trim() || "",
      price: Number(item.price),
      imageUrl: item.imageUrl?.trim() || "/images/studios/nature-grid.jpg",
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
    const current = await getStudioWizardCatalog();
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
    const cleanId = item.id.trim();
    const cleanTitle = item.title.trim();
    if (!cleanId || !cleanTitle || Number(item.price) < 0) {
      return { success: false, error: "Valid crew item ID, title, and rate are required." };
    }

    const current = await getStudioWizardCatalog();
    const normalized: CrewEquipmentItem = {
      id: cleanId,
      title: cleanTitle,
      description: item.description?.trim() || "",
      price: Number(item.price),
      priceType: item.priceType === "flat" ? "flat" : "hourly",
      category: item.category === "equipment" ? "equipment" : "crew",
      imageUrl: item.imageUrl?.trim() || "/images/studios/nature-grid.jpg",
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
    const current = await getStudioWizardCatalog();
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
    const cleanId = item.id.trim();
    const cleanTitle = item.title.trim();
    if (!cleanId || !cleanTitle || Number(item.price) < 0) {
      return { success: false, error: "Valid prop ID, title, and rate are required." };
    }

    const current = await getStudioWizardCatalog();
    const normalized: PropItem = {
      id: cleanId,
      title: cleanTitle,
      price: Number(item.price),
      priceType: item.priceType === "hourly" ? "hourly" : "flat",
      category: item.category?.trim() || "Furniture",
      imageUrl: item.imageUrl?.trim() || "/images/studios/nature-grid.jpg",
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
    const current = await getStudioWizardCatalog();
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
    const cleanId = item.id.trim();
    const cleanTitle = item.title.trim();
    if (!cleanId || !cleanTitle || Number(item.price) < 0) {
      return { success: false, error: "Valid add-on ID, title, and rate are required." };
    }

    const current = await getStudioWizardCatalog();
    const normalized: AddonItem = {
      id: cleanId,
      title: cleanTitle,
      description: item.description?.trim() || "",
      price: Number(item.price),
      priceType: item.priceType === "hourly" ? "hourly" : "flat",
      imageUrl: item.imageUrl?.trim() || "/images/studios/nature-grid.jpg",
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
    const current = await getStudioWizardCatalog();
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
