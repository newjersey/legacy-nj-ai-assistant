export const DISABLE_COACH_MARKS_FOR_TEST_STORAGE_KEY = "disable_coach_marks_for_tests";

const HIDE_COACH_MARK_STORAGE_KEY_PREFIX = "hide_coach_mark";
export const getHideCoachMarkStorageKey = (id: string) => {
  return `${HIDE_COACH_MARK_STORAGE_KEY_PREFIX}__${id}`;
};
