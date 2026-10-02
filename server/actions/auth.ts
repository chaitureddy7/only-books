"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export interface SignInFormState {
  error?: string;
  sent?: boolean;
}

export async function sendMagicLink(_prevState: SignInFormState, formData: FormData): Promise<SignInFormState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    return { error: "Enter a valid email address" };
  }

  try {
    await signIn("nodemailer", { email, redirect: false, redirectTo: "/onboarding" });
    return { sent: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Could not send sign-in link. Please try again." };
    }
    throw err;
  }
}
