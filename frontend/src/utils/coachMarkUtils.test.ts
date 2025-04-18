import {
  clearOldHideCoachMarkStorageKeys,
  getHideCoachMarkStorageKey,
  HIDE_COACH_MARK_STORAGE_KEY_PREFIX,
} from "./coachMarkUtils";

describe(clearOldHideCoachMarkStorageKeys.name, () => {
  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  const setHideCoachMarkKeyToLocalStorage = (coachMarkId: string) => {
    localStorage.setItem(getHideCoachMarkStorageKey(coachMarkId), "true");
  };

  const getHideCoachMarkKeyFromLocalStorage = (coachMarkId: string) => {
    return localStorage.getItem(getHideCoachMarkStorageKey(coachMarkId));
  };

  it("removes hideCoachMark keys that do not match the given id", () => {
    const oldCoachMarkId1 = "old-feature-1";
    const oldCoachMarkId2 = "old-feature-2";
    const coachMarkId = "current-coach-mark";

    setHideCoachMarkKeyToLocalStorage(oldCoachMarkId1);
    setHideCoachMarkKeyToLocalStorage(oldCoachMarkId2);
    setHideCoachMarkKeyToLocalStorage(coachMarkId);

    expect(getHideCoachMarkKeyFromLocalStorage(oldCoachMarkId1)).not.toBeNull();
    expect(getHideCoachMarkKeyFromLocalStorage(oldCoachMarkId2)).not.toBeNull();

    clearOldHideCoachMarkStorageKeys(coachMarkId);

    expect(getHideCoachMarkKeyFromLocalStorage(oldCoachMarkId1)).toBeNull();
    expect(getHideCoachMarkKeyFromLocalStorage(oldCoachMarkId2)).toBeNull();
    expect(getHideCoachMarkKeyFromLocalStorage(coachMarkId)).not.toBeNull();
  });

  it("removes hideCoachMark key if its id contains but does not exactly match the current id", () => {
    const oldIdThatIncludesCurrentId = "coach-mark-old";
    const currentId = "coach-mark";

    setHideCoachMarkKeyToLocalStorage(oldIdThatIncludesCurrentId);
    setHideCoachMarkKeyToLocalStorage(currentId);

    expect(getHideCoachMarkKeyFromLocalStorage(oldIdThatIncludesCurrentId)).not.toBeNull();

    clearOldHideCoachMarkStorageKeys(currentId);

    expect(localStorage.getItem(oldIdThatIncludesCurrentId)).toBeNull();
  });

  it("does not remove unrelated keys in localStorage", () => {
    const oldCoachMarkId1 = "old-coach-mark-1";
    const oldCoachMarkId2 = "old-coach-mark-2";
    const coachMarkId = "current-coach-mark";

    const unrelatedKey1 = "unrelated-key-1";
    const unrelatedKey2 = "unrelated-key-2";

    setHideCoachMarkKeyToLocalStorage(oldCoachMarkId1);
    localStorage.setItem(unrelatedKey1, "");
    setHideCoachMarkKeyToLocalStorage(oldCoachMarkId2);
    setHideCoachMarkKeyToLocalStorage(coachMarkId);
    localStorage.setItem(unrelatedKey2, "");

    expect(localStorage.getItem(unrelatedKey1)).toBeNull();
    expect(localStorage.getItem(unrelatedKey2)).toBeNull();

    clearOldHideCoachMarkStorageKeys(coachMarkId);

    expect(localStorage.getItem(unrelatedKey1)).not.toBeNull();
    expect(localStorage.getItem(unrelatedKey2)).not.toBeNull();
  });

  it(`does not remove unrelated keys, even if they contain (but do not start with) ${HIDE_COACH_MARK_STORAGE_KEY_PREFIX}`, () => {
    const coachMarkId = "coach-mark";

    const unrelatedKeyContainingPrefix = `unrelated-key-${HIDE_COACH_MARK_STORAGE_KEY_PREFIX}`;

    setHideCoachMarkKeyToLocalStorage(coachMarkId);
    localStorage.setItem(unrelatedKeyContainingPrefix, "");

    clearOldHideCoachMarkStorageKeys(coachMarkId);

    expect(localStorage.getItem(unrelatedKeyContainingPrefix)).not.toBeNull();
  });
});
