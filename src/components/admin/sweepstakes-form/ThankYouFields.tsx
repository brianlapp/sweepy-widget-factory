import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types";

interface ThankYouFieldsProps {
  form: UseFormReturn<FormData>;
}

export function ThankYouFields({ form }: ThankYouFieldsProps) {
  return (
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
  );
}