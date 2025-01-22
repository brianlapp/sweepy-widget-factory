import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types";
import { Progress } from "@/components/ui/progress";

interface ThemeFieldsProps {
  form: UseFormReturn<FormData>;
}

const ThemePreview = ({ theme, value = 75 }: { theme: "green" | "blue" | "orange", value?: number }) => {
  const gradients = {
    green: 'linear-gradient(90deg, rgb(134, 239, 172), rgb(59, 130, 246))',
    blue: 'linear-gradient(90deg, rgb(96, 165, 250), rgb(99, 102, 241))',
    orange: 'linear-gradient(90deg, rgb(251, 146, 60), rgb(251, 191, 36))'
  };

  const backgrounds = {
    green: 'bg-green-100 dark:bg-green-950/50',
    blue: 'bg-blue-100 dark:bg-blue-950/50',
    orange: 'bg-orange-100 dark:bg-orange-950/50'
  };

  return (
    <div className="w-full h-2.5">
      <Progress 
        value={value} 
        className={`h-2.5 ${backgrounds[theme]}`}
        style={{
          backgroundImage: gradients[theme],
          backgroundSize: `${value}% 100%`,
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
};

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
                <SelectItem value="green" className="space-y-2">
                  <span>Green (Default)</span>
                  <ThemePreview theme="green" />
                </SelectItem>
                <SelectItem value="blue" className="space-y-2">
                  <span>Blue</span>
                  <ThemePreview theme="blue" />
                </SelectItem>
                <SelectItem value="orange" className="space-y-2">
                  <span>Orange</span>
                  <ThemePreview theme="orange" />
                </SelectItem>
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