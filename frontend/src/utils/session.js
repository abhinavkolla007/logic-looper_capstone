const STORAGE_KEY = "logic-looper-user";

export const loadStoredUser = () => {
  const value = localStorage.getItem(STORAGE_KEY);
  return value ? JSON.parse(value) : null;
};

export const saveStoredUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
};
