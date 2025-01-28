import { useParams } from 'react-router-dom';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  console.log('Preview page - Sweepstakes ID:', id);

  const { data: sweepstakes, isLoading, error } = useQuery({
    queryKey: ['sweepstakes', id],
    queryFn: async () => {
      console.log('Fetching sweepstakes data for ID:', id);
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching sweepstakes:', error);
        throw error;
      }
      console.log('Fetched sweepstakes data:', data);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-[600px] w-full max-w-md mx-auto" />
      </div>
    );
  }

  if (error || !sweepstakes) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Sweepstakes Not Found</h2>
        <p className="text-gray-600">The sweepstakes you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
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