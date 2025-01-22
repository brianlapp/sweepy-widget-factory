import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types";

interface ThemeFieldsProps {
  form: UseFormReturn<FormData>;
}

export function ThemeFields({ form }: ThemeFieldsProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-lg font-medium">Theme Settings</h3>
      
      <FormField
        control={form.control}
        name="button_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Form Button Color</FormLabel>
            <div className="flex gap-2 items-center">
              <FormControl>
                <Input type="text" placeholder="#8B5CF6" {...field} />
              </FormControl>
              <Input
                type="color"
                value={field.value || '#8B5CF6'}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-12 h-10 p-1"
              />
            </div>
            <FormDescription>
              Choose a color for the form submit button
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="progress_theme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Progress Bar Theme</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="green">Green (Default)</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Choose a color theme for the progress bar
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}