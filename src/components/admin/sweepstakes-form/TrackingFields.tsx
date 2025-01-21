import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types";

interface TrackingFieldsProps {
  form: UseFormReturn<FormData>;
}

export function TrackingFields({ form }: TrackingFieldsProps) {
  return (
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
  );
}