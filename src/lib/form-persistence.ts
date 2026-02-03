import { AnonymousFormData } from "@/lib/validations/form-schema";

/**
 * Storage key for localStorage
 */
const STORAGE_KEY = "anonymous-form-draft";

/**
 * Time-to-live for form drafts (7 days in milliseconds)
 */
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Interface for stored form draft with metadata
 */
interface FormDraft {
  data: Partial<AnonymousFormData>;
  timestamp: number;
}

/**
 * Saves the current form data to localStorage with timestamp
 *
 * @param data - Partial form data to save
 * @returns boolean indicating success
 */
export function saveFormDraft(data: Partial<AnonymousFormData>): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const draft: FormDraft = {
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error("Failed to save form draft:", error);
    return false;
  }
}

/**
 * Loads form draft from localStorage if not expired
 * Automatically clears expired drafts
 *
 * @returns Partial form data if available and not expired, null otherwise
 */
export function loadFormDraft(): Partial<AnonymousFormData> | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const draft: FormDraft = JSON.parse(stored);
    const now = Date.now();
    const age = now - draft.timestamp;

    // Check if draft has expired (older than 7 days)
    if (age > DRAFT_TTL) {
      clearFormDraft();
      return null;
    }

    return draft.data;
  } catch (error) {
    console.error("Failed to load form draft:", error);
    // Clear corrupted data
    clearFormDraft();
    return null;
  }
}

/**
 * Removes the form draft from localStorage
 *
 * @returns boolean indicating success
 */
export function clearFormDraft(): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear form draft:", error);
    return false;
  }
}

/**
 * Checks if a form draft exists and is not expired
 *
 * @returns boolean indicating if a valid draft exists
 */
export function hasValidDraft(): boolean {
  return loadFormDraft() !== null;
}

/**
 * Gets the age of the current draft in days
 *
 * @returns number of days since draft was saved, or null if no draft exists
 */
export function getDraftAge(): number | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const draft: FormDraft = JSON.parse(stored);
    const now = Date.now();
    const age = now - draft.timestamp;

    return Math.floor(age / (24 * 60 * 60 * 1000));
  } catch (error) {
    console.error("Failed to get draft age:", error);
    return null;
  }
}
