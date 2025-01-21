import { supabase } from "@/integrations/supabase/client";
import readme from "../../README.md?raw";

export async function uploadReadme() {
  try {
    const { data, error } = await supabase.storage
      .from('static')
      .upload('README.md', new Blob([readme], { type: 'text/markdown' }), {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Failed to upload README:', error);
      throw error;
    }

    console.log('README uploaded successfully:', data);
  } catch (error) {
    console.error('Error in uploadReadme:', error);
    throw error;
  }
}