export const PRIORITY_STORAGE_KEY = "priorityOrder";

export const getPriorityOrder = (): string[] => {
  try {
    const stored = localStorage.getItem(PRIORITY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed
          .filter((value) => typeof value === "string" || typeof value === "number")
          .map((value) => String(value))
      : [];
  } catch {
    return [];
  }
};

export const setPriorityOrder = (order: string[]) => {
  localStorage.setItem(PRIORITY_STORAGE_KEY, JSON.stringify(order));
};
