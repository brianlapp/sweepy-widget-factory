import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
  const handleContinue = () => {
    if (trackingUrl) {
      window.location.href = trackingUrl;
    }
  };

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

      {trackingUrl && (
        <Button 
          onClick={handleContinue}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-lg font-medium"
        >
          Continue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
}