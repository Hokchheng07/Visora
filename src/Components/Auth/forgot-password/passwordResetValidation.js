import { z } from "zod";

export const emailSchema = z.string().trim().email();
export const rules = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "Include uppercase and lowercase letters", test: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value) },
  { label: "Include a number or special character", test: (value) => /[0-9]|[^A-Za-z0-9\s]/.test(value) },
];
