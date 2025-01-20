import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormFields } from "./FormFields";
import { formSchema, FormData } from "./types";
import { submitSweepstakesEntry } from "./api";

interface SweepstakesFormProps {
  sweepstakesId: string;
}

export function SweepstakesForm({ sweepstakesId }: SweepstakesFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      terms_accepted: false,
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      await submitSweepstakesEntry(sweepstakesId, values);
      toast.success("Thank you for entering!");
    } catch (error) {
      console.error('Error submitting entry:', error);
      toast.error("There was an error submitting your entry. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <FormFields form={form} />
        <Button type="submit" className="w-full h-11 sm:h-10 text-base sm:text-sm">
          Enter Sweepstakes
        </Button>
      </form>
    </Form>
  );
}