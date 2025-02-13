import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormFields } from "./FormFields";
import { formSchema, FormData, SweepstakesFormProps } from "./types";
import { submitEntry } from "./api";
import { ThankYouPage } from "./ThankYouPage";

export function SweepstakesForm({ 
  sweepstakesId,
  thankYouHeadline,
  thankYouImageUrl,
  trackingUrl,
  onSubmitSuccess,
  buttonColor = '#8B5CF6'
}: SweepstakesFormProps) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
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
      await submitEntry(sweepstakesId, values);
      setIsSubmitted(true);
      onSubmitSuccess?.();
      toast.success("Thank you for entering!");
    } catch (error) {
      console.error('Error submitting entry:', error);
      toast.error(error instanceof Error ? error.message : "There was an error submitting your entry. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <ThankYouPage 
        headline={thankYouHeadline}
        imageUrl={thankYouImageUrl}
        trackingUrl={trackingUrl}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <FormFields form={form} />
        <Button 
          type="submit" 
          className="w-full h-11 sm:h-10 text-base sm:text-sm"
          style={{ backgroundColor: buttonColor }}
        >
          Enter Sweepstakes
        </Button>
      </form>
    </Form>
  );
}