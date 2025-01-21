import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-semibold">{headline}</h2>
      
      {imageUrl && (
        <div className="flex justify-center">
          <img 
            src={imageUrl} 
            alt="Thank you"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
}