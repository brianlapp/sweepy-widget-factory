import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SweepstakesHeader } from "./sweepstakes/SweepstakesHeader";
import { SweepstakesForm } from "./sweepstakes/SweepstakesForm";
import { EntriesProgress } from "./sweepstakes/EntriesProgress";
import { SweepstakesWidgetProps } from "./sweepstakes/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SweepstakesWidget({ 
  sweepstakesId, 
  title: defaultTitle = "Enter to Win!", 
  imageUrl: defaultImageUrl = "/placeholder.svg",
  disclaimer,
  thankYouHeadline,
  thankYouImageUrl,
  trackingUrl,
  onReady
}: SweepstakesWidgetProps) {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const { data: sweepstakes, isLoading } = useQuery({
    queryKey: ['sweepstakes', sweepstakesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', sweepstakesId)
        .single();
      
      if (error) {
        console.error('Error fetching sweepstakes:', error);
        throw error;
      }
      return data;
    },
    enabled: !!sweepstakesId,
    onSuccess: () => {
      onReady?.();
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const showProgress = sweepstakes?.draw_type === 'entries' && !isSubmitted;
  const displayTitle = sweepstakes?.title || defaultTitle;
  const displayImage = sweepstakes?.image_url || defaultImageUrl;
  const displayDisclaimer = sweepstakes?.description || disclaimer;

  return (
    <Card className="w-full max-w-md mx-auto sm:w-[95%] md:w-full">
      {!isSubmitted && <SweepstakesHeader title={displayTitle} imageUrl={displayImage} />}
      
      <CardContent className="p-4 sm:p-6 space-y-4">
        {showProgress && sweepstakes && (
          <EntriesProgress 
            currentEntries={sweepstakes.current_entries || 0}
            entriesToDraw={sweepstakes.entries_to_draw}
            entryValue={sweepstakes.entry_value || 0.10}
            prizeValue={sweepstakes.prize_value || 25.00}
            theme={(sweepstakes.progress_theme || 'green') as "green" | "blue" | "orange"}
          />
        )}
        <SweepstakesForm 
          sweepstakesId={sweepstakesId}
          thankYouHeadline={sweepstakes?.thank_you_headline || thankYouHeadline}
          thankYouImageUrl={sweepstakes?.thank_you_image_url || thankYouImageUrl}
          trackingUrl={sweepstakes?.tracking_url || trackingUrl}
          onSubmitSuccess={() => setIsSubmitted(true)}
          buttonColor={sweepstakes?.button_color}
        />
      </CardContent>

      {!isSubmitted && displayDisclaimer && (
        <CardFooter className="text-sm text-muted-foreground text-center px-4 sm:px-6">
          {displayDisclaimer}
        </CardFooter>
      )}
    </Card>
  );
}