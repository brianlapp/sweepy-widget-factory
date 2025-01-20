import { z } from "zod";

export const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  age: z.string().optional().transform((val) => val ? parseInt(val, 10) : null),
  country: z.string().optional(),
  gender: z.string().optional(),
  postal_code: z.string().optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type FormData = z.infer<typeof formSchema>;

export interface SweepstakesWidgetProps {
  sweepstakesId: string;
  title?: string;
  imageUrl?: string;
  disclaimer?: string;
}