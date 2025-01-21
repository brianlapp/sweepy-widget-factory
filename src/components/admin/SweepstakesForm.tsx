import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formSchema } from "./types";
import type { FormData } from "./types";
import { BasicInfoFields } from "./sweepstakes-form/BasicInfoFields";
import { DateFields } from "./sweepstakes-form/DateFields";
import { ThankYouFields } from "./sweepstakes-form/ThankYouFields";
import { TrackingFields } from "./sweepstakes-form/TrackingFields";
import { useSweepstakesMutations } from "./sweepstakes-form/useSweepstakesMutations";

interface SweepstakesFormProps {
  sweepstakesId?: string;
}

export function SweepstakesForm({ sweepstakesId }: SweepstakesFormProps) {
  const navigate = useNavigate();
  const { createMutation, updateMutation, isEditing } = useSweepstakesMutations(sweepstakesId);

  const { data: sweepstakes, isLoading } = useQuery({
    queryKey: ['sweepstakes', sweepstakesId],
    queryFn: async () => {
      if (!sweepstakesId) return null;
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', sweepstakesId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      prize_info: "",
      image_url: "",
      entries_to_draw: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
      thank_you_headline: "",
      thank_you_image_url: "",
      tracking_url: "",
      impression_pixel: "",
    },
  });

  React.useEffect(() => {
    if (sweepstakes) {
      const formattedSweepstakes = {
        ...sweepstakes,
        start_date: new Date(sweepstakes.start_date).toISOString().split('T')[0],
        end_date: new Date(sweepstakes.end_date).toISOString().split('T')[0],
      };
      form.reset(formattedSweepstakes);
    }
  }, [sweepstakes, form]);

  const onSubmit = (values: FormData) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  if (isEditing && isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            <BasicInfoFields form={form} />
            <DateFields form={form} />
            
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable this sweepstakes
                </div>
              </div>
              <Switch
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
            </div>

            <ThankYouFields form={form} />
            <TrackingFields form={form} />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/sweepstakes")}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Sweepstakes" : "Create Sweepstakes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}