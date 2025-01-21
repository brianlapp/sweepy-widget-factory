import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FormData } from "../types";

interface TrackingFieldsProps {
  form: UseFormReturn<FormData>;
}

export function TrackingFields({ form }: TrackingFieldsProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-lg font-medium">Tracking & Integration Settings</h3>
      <FormField
        control={form.control}
        name="tracking_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tracking URL</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com/track" {...field} />
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
              <Input placeholder="Impression tracking pixel URL" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="beehiiv_tag"
        render={({ field }) => (
          <FormItem>
            <FormLabel>BeehiiV Custom Tag</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., free-burts-bees" 
                {...field} 
                value={field.value || ''} 
              />
            </FormControl>
            <FormMessage />
            <div className="text-sm text-muted-foreground">
              Custom tag for BeehiiV subscriber segmentation. All subscribers will also receive the "sweeps" tag automatically.
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}