import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DrawTypeFieldsProps {
  form: UseFormReturn<FormData>;
}

export function DrawTypeFields({ form }: DrawTypeFieldsProps) {
  const drawType = form.watch('draw_type');

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="draw_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Draw Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="date" />
                  <label htmlFor="date">Date-based</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entries" id="entries" />
                  <label htmlFor="entries">Entries-based</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {drawType === 'entries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entry_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Value ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prize_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prize Value ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}