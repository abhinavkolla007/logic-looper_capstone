export function loadStoredUser() {
  const stored = localStorage.getItem("logicUser");
  return stored ? JSON.parse(stored) : null;
}