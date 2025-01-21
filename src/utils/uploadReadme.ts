import { supabase } from "@/integrations/supabase/client";
import readme from "../../README.md?raw";

export async function uploadReadme() {
  const { error } = await supabase.storage
    .from('static')
    .upload('/README.md', new Blob([readme], { type: 'text/markdown' }), {
      upsert: true
    });

  if (error) {
    console.error('Failed to upload README:', error);
    throw error;
  }

  console.log('README uploaded successfully');
}