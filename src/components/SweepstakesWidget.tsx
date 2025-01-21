import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SweepstakesHeader } from "./sweepstakes/SweepstakesHeader";
import { SweepstakesForm } from "./sweepstakes/SweepstakesForm";
import { SweepstakesWidgetProps } from "./sweepstakes/types";

export function SweepstakesWidget({ 
  sweepstakesId, 
  title = "Enter to Win!", 
  imageUrl = "/placeholder.svg",
  disclaimer,
  thankYouHeadline,
  thankYouImageUrl,
  trackingUrl
}: SweepstakesWidgetProps) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  return (
    <Card className="w-full max-w-md mx-auto sm:w-[95%] md:w-full">
      {!isSubmitted && <SweepstakesHeader title={title} imageUrl={imageUrl} />}
      
      <CardContent className="p-4 sm:p-6">
        <SweepstakesForm 
          sweepstakesId={sweepstakesId}
          thankYouHeadline={thankYouHeadline}
          thankYouImageUrl={thankYouImageUrl}
          trackingUrl={trackingUrl}
          onSubmitSuccess={() => setIsSubmitted(true)}
        />
      </CardContent>

      {!isSubmitted && disclaimer && (
        <CardFooter className="text-sm text-muted-foreground text-center px-4 sm:px-6">
          {disclaimer}
        </CardFooter>
      )}
    </Card>
  );
}