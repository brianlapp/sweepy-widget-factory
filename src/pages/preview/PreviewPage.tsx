import { useParams } from 'react-router-dom';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();

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
    return <div className="container py-8">Loading...</div>;
  }

  if (!sweepstakes) {
    return <div className="container py-8">Sweepstakes not found</div>;
  }

  return (
    <div className="container py-8 max-w-md mx-auto">
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