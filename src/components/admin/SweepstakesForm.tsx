import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formSchema } from "./types";
import type { FormData } from "./types";

interface SweepstakesFormProps {
  sweepstakesId?: string;
}

export function SweepstakesForm({ sweepstakesId }: SweepstakesFormProps) {
  const navigate = useNavigate();
  const isEditing = Boolean(sweepstakesId);

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
      // Format dates for input[type="date"]
      const formattedSweepstakes = {
        ...sweepstakes,
        start_date: new Date(sweepstakes.start_date).toISOString().split('T')[0],
        end_date: new Date(sweepstakes.end_date).toISOString().split('T')[0],
      };
      form.reset(formattedSweepstakes);
    }
  }, [sweepstakes, form]);

  const createMutation = useMutation({
    mutationFn: async (values: FormData) => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .insert({
          ...values,
          // Ensure dates are in the correct format
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString(),
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
          ...values,
          // Ensure dates are in the correct format
          start_date: new Date(values.start_date).toISOString(),
          end_date: new Date(values.end_date).toISOString(),
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

  // ... keep existing code (the JSX form render part remains unchanged)

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter sweepstakes title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter sweepstakes description"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prize_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter prize details"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entries_to_draw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Winners</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this sweepstakes
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Thank You Page Settings</h3>
              <FormField
                control={form.control}
                name="thank_you_headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thank You Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter thank you headline" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thank_you_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thank You Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter thank you image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Tracking Settings</h3>
              <FormField
                control={form.control}
                name="tracking_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tracking URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impression_pixel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impression Pixel</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter impression pixel code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
