import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  prize_info: z.string().optional(),
  image_url: z.string().optional(),
  entries_to_draw: z.number().min(1, "Must select at least 1 winner"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_active: z.boolean(),
  thank_you_headline: z.string().optional(),
  thank_you_image_url: z.string().optional(),
  tracking_url: z.string().optional(),
  impression_pixel: z.string().optional(),
  draw_type: z.enum(['date', 'entries']).default('date'),
  entry_value: z.number().min(0.01, "Entry value must be at least $0.01").default(0.10),
  prize_value: z.number().min(1, "Prize value must be at least $1").default(25.00),
  beehiiv_tag: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;