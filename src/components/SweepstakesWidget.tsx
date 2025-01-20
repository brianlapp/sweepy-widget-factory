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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  age: z.string().optional().transform((val) => val ? parseInt(val, 10) : null),
  country: z.string().optional(),
  gender: z.string().optional(),
  postal_code: z.string().optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

interface SweepstakesWidgetProps {
  sweepstakesId: string;
  title?: string;
  imageUrl?: string;
  disclaimer?: string;
}

export function SweepstakesWidget({ 
  sweepstakesId, 
  title = "Enter to Win!", 
  imageUrl = "/placeholder.svg",
  disclaimer 
}: SweepstakesWidgetProps) {
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
    <Card className="w-full max-w-md mx-auto sm:w-[95%] md:w-full">
      <CardHeader className="space-y-2 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>

      <div className="px-4 sm:px-6">
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt="Sweepstakes"
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </div>

      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">First Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John" 
                      {...field} 
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
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
                  <FormLabel className="text-sm sm:text-base">Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Doe" 
                      {...field} 
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
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
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="john@example.com" 
                      type="email" 
                      {...field} 
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
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
                  <FormLabel className="text-sm sm:text-base">Gender (Optional)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" className="h-5 w-5" />
                        </FormControl>
                        <FormLabel className="font-normal text-base sm:text-sm">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" className="h-5 w-5" />
                        </FormControl>
                        <FormLabel className="font-normal text-base sm:text-sm">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" className="h-5 w-5" />
                        </FormControl>
                        <FormLabel className="font-normal text-base sm:text-sm">Other</FormLabel>
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
                      className="mt-1 h-5 w-5"
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-base sm:text-sm">
                    I accept the terms and conditions
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11 sm:h-10 text-base sm:text-sm">
              Enter Sweepstakes
            </Button>
          </form>
        </Form>
      </CardContent>

      {disclaimer && (
        <CardFooter className="text-sm text-muted-foreground text-center px-4 sm:px-6">
          {disclaimer}
        </CardFooter>
      )}
    </Card>
  );
}