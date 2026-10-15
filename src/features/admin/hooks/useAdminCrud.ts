"use client";

import { useState, useCallback } from "react";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";

export interface UseAdminCrudOptions<T> {
  initialData: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertAction?: (data: any) => Promise<{ success: boolean; error?: string }>;
  deleteAction?: (id: string) => Promise<{ success: boolean; error?: string }>;
  getItemId: (item: T | Partial<T>) => string | undefined;
  getItemSlug?: (item: T | Partial<T>) => string | undefined;
  getItemName?: (item: T | Partial<T>) => string | undefined;
  defaultNewItem?: Partial<T>;
  successMessage?: string;
}

export function useAdminCrud<T>({
  initialData,
  upsertAction,
  deleteAction,
  getItemId,
  getItemSlug,
  getItemName,
  defaultNewItem,
  successMessage = "Record saved successfully.",
}: UseAdminCrudOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [editingItem, setEditingItem] = useState<Partial<T> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3500);

  const handleOpenNew = useCallback(
    (customDefaults?: Partial<T>) => {
      setFormError(null);
      clearFeedback();
      setEditingItem(customDefaults || defaultNewItem || {});
    },
    [clearFeedback, defaultNewItem]
  );

  const handleOpenEdit = useCallback((item: T) => {
    setFormError(null);
    setEditingItem({ ...item });
  }, []);

  const handleCloseEdit = useCallback(() => {
    if (isSubmitting) return;
    setEditingItem(null);
    setFormError(null);
  }, [isSubmitting]);

  const handleSave = async (data: Partial<T>): Promise<boolean> => {
    if (!upsertAction) return false;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await upsertAction(data);
      if (res.success) {
        setItems((prev) => {
          const targetId = getItemId(data);
          const targetSlug = getItemSlug?.(data);

          const index = prev.findIndex((item) => {
            const pId = getItemId(item);
            const pSlug = getItemSlug?.(item);
            return (targetId && pId === targetId) || (targetSlug && pSlug === targetSlug);
          });

          if (index >= 0) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...data } as T;
            return updated;
          }

          return [
            {
              ...data,
              id: targetId || (targetSlug ? targetSlug : `item-${Date.now()}`),
              createdAt: new Date(),
            } as unknown as T,
            ...prev,
          ];
        });

        const name = getItemName?.(data) || "Record";
        showFeedback(getItemName ? `${name} saved successfully.` : successMessage);
        setEditingItem(null);
        return true;
      } else {
        setFormError(res.error || "Failed to save record.");
        return false;
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save record.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = useCallback((item: T) => {
    setDeleteError(null);
    setItemToDelete(item);
  }, []);

  const handleCloseDelete = useCallback(() => {
    if (isDeleting) return;
    setItemToDelete(null);
    setDeleteError(null);
  }, [isDeleting]);

  const handleConfirmDelete = async (): Promise<boolean> => {
    if (!itemToDelete || !deleteAction) return false;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const targetId = getItemId(itemToDelete) || getItemSlug?.(itemToDelete);
      if (!targetId) throw new Error("Item identifier missing.");

      const res = await deleteAction(targetId);
      if (res.success) {
        setItems((prev) =>
          prev.filter((item) => {
            const pId = getItemId(item);
            const pSlug = getItemSlug?.(item);
            return pId !== targetId && pSlug !== targetId;
          })
        );
        const name = getItemName?.(itemToDelete) || "Item";
        showFeedback(`${name} deleted successfully.`);
        setItemToDelete(null);
        return true;
      } else {
        setDeleteError(res.error || "Failed to delete record.");
        return false;
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete record.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateItemDirect = useCallback((idOrSlug: string, partial: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => {
        const id = getItemId(item);
        const slug = getItemSlug?.(item);
        if (id === idOrSlug || slug === idOrSlug) {
          return { ...item, ...partial };
        }
        return item;
      })
    );
  }, [getItemId, getItemSlug]);

  return {
    items,
    setItems,
    editingItem,
    setEditingItem,
    itemToDelete,
    isSubmitting,
    isDeleting,
    formError,
    setFormError,
    deleteError,
    feedback,
    showFeedback,
    clearFeedback,
    handleOpenNew,
    handleOpenEdit,
    handleCloseEdit,
    handleSave,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
    updateItemDirect,
  };
}
