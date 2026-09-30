import { useState, useCallback } from "react";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";

export interface CrudOptions<T> {
  initialData: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertAction: (data: any) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  getId: (item: T | Partial<T>) => string | undefined;
  getSlug: (item: T | Partial<T>) => string | undefined;
  defaultNewItem: Partial<T>;
  onSuccessMessage?: string;
}

export function useCrud<T>({
  initialData,
  upsertAction,
  deleteAction,
  getId,
  getSlug,
  defaultNewItem,
  onSuccessMessage = "Item successfully updated!",
}: CrudOptions<T>) {
  const [dataList, setDataList] = useState<T[]>(initialData);
  const [editingItem, setEditingItem] = useState<Partial<T> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(1200);

  const handleOpenNew = useCallback(() => {
    setError(null);
    clearFeedback();
    setEditingItem(defaultNewItem);
  }, [clearFeedback, defaultNewItem]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSubmitting(true);
    setError(null);
    clearFeedback();

    try {
      const res = await upsertAction(editingItem);
      if (res.success) {
        showFeedback(onSuccessMessage);
        
        setDataList((prev) => {
          const itemId = getId(editingItem);
          const itemSlug = getSlug(editingItem);
          
          const idx = prev.findIndex((p) => {
            const pId = getId(p);
            const pSlug = getSlug(p);
            return (itemId && pId === itemId) || (itemSlug && pSlug === itemSlug);
          });

          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...editingItem } as T;
            return updated;
          }
          return [
            {
              ...editingItem,
              id: itemId || `item-${Date.now()}`,
              createdAt: new Date(),
              publishedAt: new Date(),
            } as unknown as T,
            ...prev,
          ];
        });

        setTimeout(() => {
          setEditingItem(null);
        }, 1200);
      } else {
        setError(res.error || "Failed to update item.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    if (!confirm(`Are you sure you want to delete ${name || "this item"}?`)) return;
    try {
      const res = await deleteAction(id);
      if (res.success) {
        setDataList((prev) => prev.filter((p) => getId(p) !== id));
      } else {
        alert(res.error || "Failed to delete item.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item.");
    }
  };

  return {
    dataList,
    setDataList,
    editingItem,
    setEditingItem,
    isSubmitting,
    error,
    setError,
    feedback,
    showFeedback,
    clearFeedback,
    handleOpenNew,
    handleSave,
    handleDelete,
  };
}
