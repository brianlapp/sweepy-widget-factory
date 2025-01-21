import { FormData } from "./types";
import { supabase } from "@/integrations/supabase/client";

export async function submitEntry(sweepstakesId: string, formData: FormData) {
  // Check for existing entries today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const { count } = await supabase
    .from('sweepstakes_entries')
    .select('*', { count: 'exact', head: true })
    .eq('sweepstakes_id', sweepstakesId)
    .eq('email', formData.email)
    .gte('created_at', startOfDay.toISOString());

  if (count && count > 0) {
    throw new Error("You've already entered this sweepstakes today. Please try again tomorrow!");
  }

  // If no entries today, submit the new entry
  const { data, error } = await supabase
    .from('sweepstakes_entries')
    .insert([
      {
        sweepstakes_id: sweepstakesId,
        ...formData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}