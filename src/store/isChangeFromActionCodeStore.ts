/**
 * The variable to check if the changes are from the action code store or not.
 */
let isChangesFromActionCodeStore = false;

export const getFlashState = (): boolean => {
  const result = isChangesFromActionCodeStore;
  isChangesFromActionCodeStore = false;

  return result;
};
export const setFlashState = (value: boolean) =>
  (isChangesFromActionCodeStore = value);
