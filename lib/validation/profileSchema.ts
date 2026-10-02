import { z } from "zod";
import { MIN_SIGNUP_AGE_YEARS } from "@/lib/config";

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

function isAtLeastYearsOld(dob: Date, years: number): boolean {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return dob <= cutoff;
}

export const profileSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]),
    dob: z.coerce.date().refine((d) => isAtLeastYearsOld(d, MIN_SIGNUP_AGE_YEARS), {
      message: `You must be at least ${MIN_SIGNUP_AGE_YEARS} years old`,
    }),
    intent: z.enum(["DATING", "BOOK_BUDDY"]),
    preferredGenders: z.array(z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"])).default([]),
    city: z.string().trim().min(1, "City is required").max(100),
    pincode: z.string().regex(PINCODE_REGEX, "Enter a valid 6-digit Indian pincode"),
    consent: z.literal(true, {
      message: "You must accept the privacy policy to continue",
    }),
  })
  .refine((data) => data.intent !== "DATING" || data.preferredGenders.length > 0, {
    message: "Select at least one preferred gender for dating matches",
    path: ["preferredGenders"],
  });

export type ProfileInput = z.infer<typeof profileSchema>;
