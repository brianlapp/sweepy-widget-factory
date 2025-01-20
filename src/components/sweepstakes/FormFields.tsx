import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "./types";

interface FormFieldsProps {
  form: UseFormReturn<FormData>;
}

export function FormFields({ form }: FormFieldsProps) {
  return (
    <>
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
    </>
  );
}