import { supabase } from "@/integrations/supabase/client";
import { FormData } from "./types";

export const submitSweepstakesEntry = async (sweepstakesId: string, values: FormData) => {
  // First, check if Beehiiv integration is enabled for this sweepstakes
  const { data: settings } = await supabase
    .from('sweepstakes_settings')
    .select('use_beehiiv')
    .eq('sweepstakes_id', sweepstakesId)
    .single();

  // Save entry to database
  const { error: entryError } = await supabase
    .from('sweepstakes_entries')
    .insert({
      sweepstakes_id: sweepstakesId,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      age: values.age,
      country: values.country,
      gender: values.gender,
      postal_code: values.postal_code,
      terms_accepted: values.terms_accepted,
    });

  if (entryError) throw entryError;

  // If Beehiiv is enabled, sync the entry
  if (settings?.use_beehiiv) {
    console.log('Beehiiv integration will be implemented here');
  }
};