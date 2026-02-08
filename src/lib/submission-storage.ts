/**
 * Submission status returned by checkSubmissionStatus()
 */
export interface SubmissionStatus {
  hasSubmitted: boolean;
  deviceId: string;
  timestamp?: string;
}

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  SUBMITTED: "meetup_form_submitted",
  DEVICE_ID: "meetup_device_id",
  SUBMISSION_TIME: "meetup_submission_time",
} as const;

/**
 * Cookie name for submission tracking fallback
 */
const COOKIE_NAME = "meetup_form_submitted";

/**
 * Cookie max-age in seconds (30 days)
 */
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 2592000

/**
 * Generates or retrieves an anonymous device identifier.
 * If an ID already exists in localStorage, it is returned.
 * Otherwise a new one is generated in the format `timestamp-random9chars`.
 *
 * @returns a device identifier string
 */
export function generateDeviceId(): string {
  try {
    if (typeof window === "undefined") {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    const existing = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (existing) {
      return existing;
    }

    const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, newId);
    return newId;
  } catch (error) {
    console.error("Failed to generate device ID:", error);
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Checks whether the current device has already submitted the form.
 * Uses localStorage as the primary source and falls back to cookies
 * when localStorage data is unavailable.
 *
 * @returns SubmissionStatus with submission state, device ID, and optional timestamp
 */
export function checkSubmissionStatus(): SubmissionStatus {
  try {
    if (typeof window === "undefined") {
      return { hasSubmitted: false, deviceId: generateDeviceId() };
    }

    const submitted = localStorage.getItem(STORAGE_KEYS.SUBMITTED) === "true";
    const deviceId = generateDeviceId();
    const timestamp =
      localStorage.getItem(STORAGE_KEYS.SUBMISSION_TIME) || undefined;

    if (submitted) {
      return { hasSubmitted: true, deviceId, timestamp };
    }

    // Cookie fallback when localStorage was cleared
    const cookieFallback = document.cookie.includes(
      `${COOKIE_NAME}=true`
    );
    if (cookieFallback) {
      return { hasSubmitted: true, deviceId, timestamp };
    }

    return { hasSubmitted: false, deviceId, timestamp };
  } catch (error) {
    console.error("Failed to check submission status:", error);
    return { hasSubmitted: false, deviceId: generateDeviceId() };
  }
}

/**
 * Marks the current device as having submitted the form.
 * Writes to both localStorage and a cookie for redundancy.
 * The cookie expires after 30 days and uses SameSite=Strict.
 *
 * @param deviceId - the device identifier to associate with the submission
 * @returns boolean indicating success
 */
export function markAsSubmitted(deviceId: string): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.SUBMITTED, "true");
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    localStorage.setItem(
      STORAGE_KEYS.SUBMISSION_TIME,
      new Date().toISOString()
    );

    document.cookie = `${COOKIE_NAME}=true; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Strict`;

    return true;
  } catch (error) {
    console.error("Failed to mark as submitted:", error);
    return false;
  }
}

/**
 * Clears all submission tracking data from localStorage and expires the cookie.
 * Useful for testing or allowing re-submission.
 *
 * @returns boolean indicating success
 */
export function clearSubmissionStatus(): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    localStorage.removeItem(STORAGE_KEYS.SUBMITTED);
    localStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSION_TIME);

    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Strict`;

    return true;
  } catch (error) {
    console.error("Failed to clear submission status:", error);
    return false;
  }
}
