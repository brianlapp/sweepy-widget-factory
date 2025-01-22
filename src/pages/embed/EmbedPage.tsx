import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function EmbedPage() {
  const { id } = useParams<{ id: string }>();

  // Send height updates to parent
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height }, '*');
    };

    // Send initial height
    sendHeight();

    // Set up observer for height changes
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  const { data: sweepstakes, isLoading } = useQuery({
    queryKey: ['sweepstakes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!sweepstakes) {
    return <div className="p-4">Sweepstakes not found</div>;
  }

  return (
    <div className="p-4">
      <SweepstakesWidget
        sweepstakesId={sweepstakes.id}
        title={sweepstakes.title}
        imageUrl={sweepstakes.image_url}
        disclaimer={sweepstakes.description}
        thankYouHeadline={sweepstakes.thank_you_headline}
        thankYouImageUrl={sweepstakes.thank_you_image_url}
        trackingUrl={sweepstakes.tracking_url}
      />
    </div>
  );
}