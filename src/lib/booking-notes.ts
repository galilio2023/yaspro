/** Separates system contact/package markers from the editable notes body. */
export function splitBookingNotes(value?: string | null): { metadata: string; body: string } {
  const metadata: string[] = [];
  const body = (value ?? "").replace(
    /\[Contact(?: URI)?:[^\]]*\]|\[Package:[^\]]*\]|(?:^|\|\s*)Package:[^|\r\n]*(?:\|\s*Slot:[^|\r\n]*)?/g,
    (marker) => {
      metadata.push(marker);
      return "";
    },
  ).trim().replace(/^(?:\|\s*|—\s*)?(?:Special Requests:\s*)?/, "").trim();
  return { metadata: metadata.join(" "), body };
}

/** Always take metadata from the stored booking, never from the submitted notes. */
export function replaceBookingNotes(original: string | null, notes: string): string | null {
  const { metadata } = splitBookingNotes(original);
  const { body } = splitBookingNotes(notes);
  return [metadata, body].filter(Boolean).join("\n") || null;
}
