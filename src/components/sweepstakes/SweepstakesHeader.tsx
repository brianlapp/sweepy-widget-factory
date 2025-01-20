import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

interface SweepstakesHeaderProps {
  title: string;
  imageUrl: string;
}

export function SweepstakesHeader({ title, imageUrl }: SweepstakesHeaderProps) {
  return (
    <>
      <CardHeader className="space-y-2 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>

      <div className="px-4 sm:px-6">
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt="Sweepstakes"
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      </div>
    </>
  );
}