import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ThankYouPageProps {
  headline?: string;
  imageUrl?: string;
  trackingUrl?: string;
}

export function ThankYouPage({ 
  headline = "Thank you for entering!", 
  imageUrl,
  trackingUrl
}: ThankYouPageProps) {
  React.useEffect(() => {
    if (trackingUrl) {
      window.location.href = trackingUrl;
    }
  }, [trackingUrl]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-semibold">{headline}</h2>
      </CardHeader>
      
      {imageUrl && (
        <CardContent className="flex justify-center p-6">
          <img 
            src={imageUrl} 
            alt="Thank you"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </CardContent>
      )}
    </Card>
  );
}