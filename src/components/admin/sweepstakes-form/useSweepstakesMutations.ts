import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FormData } from "../types";

export function useSweepstakesMutations(sweepstakesId?: string) {
  const navigate = useNavigate();
  const isEditing = Boolean(sweepstakesId);

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .insert({
          title: values.title,
          description: values.description,
          prize_info: values.prize_info,
          image_url: values.image_url,
          entries_to_draw: values.entries_to_draw,
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString(),
          is_active: values.is_active,
          thank_you_headline: values.thank_you_headline,
          thank_you_image_url: values.thank_you_image_url,
          tracking_url: values.tracking_url,
          impression_pixel: values.impression_pixel,
          draw_type: values.draw_type,
          entry_value: values.entry_value,
          prize_value: values.prize_value,
          beehiiv_tag: values.beehiiv_tag,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Sweepstakes created successfully!");
      navigate("/admin/sweepstakes");
    },
    onError: (error) => {
      console.error('Error creating sweepstakes:', error);
      toast.error("Failed to create sweepstakes. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .update({
          title: values.title,
          description: values.description,
          prize_info: values.prize_info,
          image_url: values.image_url,
          entries_to_draw: values.entries_to_draw,
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString(),
          is_active: values.is_active,
          thank_you_headline: values.thank_you_headline,
          thank_you_image_url: values.thank_you_image_url,
          tracking_url: values.tracking_url,
          impression_pixel: values.impression_pixel,
          draw_type: values.draw_type,
          entry_value: values.entry_value,
          prize_value: values.prize_value,
          beehiiv_tag: values.beehiiv_tag,
        })
        .eq('id', sweepstakesId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Sweepstakes updated successfully!");
      navigate("/admin/sweepstakes");
    },
    onError: (error) => {
      console.error('Error updating sweepstakes:', error);
      toast.error("Failed to update sweepstakes. Please try again.");
    },
  });

  return {
    createMutation,
    updateMutation,
    isEditing
  };
}