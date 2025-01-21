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

  // Get sweepstakes settings to check if BeehiiV sync is enabled
  const { data: settings } = await supabase
    .from('sweepstakes_settings')
    .select('use_beehiiv')
    .eq('sweepstakes_id', sweepstakesId)
    .single();

  // If no entries today, submit the new entry
  const { data, error } = await supabase
    .from('sweepstakes_entries')
    .insert({
      sweepstakes_id: sweepstakesId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      age: formData.age,
      country: formData.country,
      gender: formData.gender,
      postal_code: formData.postal_code,
      terms_accepted: formData.terms_accepted
    })
    .select()
    .single();

  if (error) throw error;

  // If BeehiiV sync is enabled, sync the subscriber
  if (settings?.use_beehiiv) {
    try {
      await supabase.functions.invoke('beehiiv-sync', {
        body: {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          utm_source: 'sweepstakes'
        }
      });
    } catch (error) {
      console.error('Error syncing with BeehiiV:', error);
      // We don't throw the error here as we don't want to fail the entry submission
      // if BeehiiV sync fails
    }
  }

  return data;
}