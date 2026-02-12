import { verifyTruecallerDev } from "./api";

export const signInWithGoogle = async () => {
  const mockEmail = window.prompt("Enter Google email for local auth", "player@example.com");

  if (!mockEmail) {
    throw new Error("Google login cancelled.");
  }

  return {
    provider: "google",
    uid: `google-${mockEmail}`,
    email: mockEmail,
    displayName: mockEmail.split("@")[0],
  };
};

export const signInAsGuest = () => {
  return {
    provider: "guest",
    uid: `guest-${Date.now()}`,
    email: null,
    displayName: "Guest Player",
  };
};

export const signInWithTruecaller = async (phone, otp) => {
  const response = await verifyTruecallerDev(phone, otp);

  return {
    provider: "truecaller",
    uid: response.uid,
    email: response.email,
    displayName: response.name,
    phone,
  };
};

export const logOut = async () => Promise.resolve();
