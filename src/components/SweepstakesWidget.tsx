import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  age: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  postal_code: z.string().optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

interface SweepstakesWidgetProps {
  sweepstakesId: string;
}

export function SweepstakesWidget({ sweepstakesId }: SweepstakesWidgetProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      terms_accepted: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
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
          ...values,
        });

      if (entryError) throw entryError;

      // If Beehiiv is enabled, sync the entry
      if (settings?.use_beehiiv) {
        // We'll implement this in the next iteration
        console.log('Beehiiv integration will be implemented here');
      }

      toast.success("Thank you for entering!");
    } catch (error) {
      console.error('Error submitting entry:', error);
      toast.error("There was an error submitting your entry. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender (Optional)</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">Other</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms_accepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  I accept the terms and conditions
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Enter Sweepstakes
          </Button>
        </form>
      </Form>
    </div>
  );
}