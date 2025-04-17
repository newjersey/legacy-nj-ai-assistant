export const DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY = "disable_coach_marks_for_tests";

const HIDE_COACH_MARK_STORAGE_KEY_PREFIX = "hide_coach_mark";
export const getHideCoachMarkStorageKey = (id: string) => {
  return `${HIDE_COACH_MARK_STORAGE_KEY_PREFIX}__${id}`;
};

export const clearOldHideCoachMarkStorageKeys = (coachMarkId: string) => {
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i)!;
    const isAHideCoachMarkKey = storageKey?.startsWith(HIDE_COACH_MARK_STORAGE_KEY_PREFIX);
    const isAnOldCoachMarkKey = isAHideCoachMarkKey && !storageKey.includes(coachMarkId);

    if (isAnOldCoachMarkKey) {
      localStorage.removeItem(storageKey);
    }
  }
};
