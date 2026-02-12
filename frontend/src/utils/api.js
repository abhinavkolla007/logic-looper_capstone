const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  return response.json();
};

export const syncDailyScores = (records) => {
  return request("/daily-scores/batch", {
    method: "POST",
    body: JSON.stringify({ records }),
  });
};

export const verifyTruecallerDev = (phone, otp) => {
  return request("/auth/truecaller/dev-verify", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
};

export { API_BASE_URL };
