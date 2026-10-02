"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation/profileSchema";

export interface ProfileFormState {
  error?: string;
}

export async function saveProfile(_prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    gender: formData.get("gender"),
    dob: formData.get("dob"),
    intent: formData.get("intent"),
    preferredGenders: formData.getAll("preferredGenders"),
    city: formData.get("city"),
    pincode: formData.get("pincode"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      gender: parsed.data.gender,
      dob: parsed.data.dob,
      intent: parsed.data.intent,
      preferredGenders: parsed.data.intent === "DATING" ? parsed.data.preferredGenders : [],
      city: parsed.data.city,
      pincode: parsed.data.pincode,
      consentGivenAt: new Date(),
      profileCompletedAt: new Date(),
    },
  });

  redirect("/onboarding/upload");
}
