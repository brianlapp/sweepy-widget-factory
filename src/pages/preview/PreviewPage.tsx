import { useParams } from 'react-router-dom';
import { SweepstakesWidget } from '@/components/SweepstakesWidget';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  console.log('[Preview Page] Rendering for sweepstakes ID:', id);

  const { data: sweepstakes, isLoading, error } = useQuery({
    queryKey: ['sweepstakes', id],
    queryFn: async () => {
      console.log('[Preview Page] Fetching sweepstakes data for ID:', id);
      if (!id) throw new Error('No sweepstakes ID provided');
      
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('[Preview Page] Error fetching sweepstakes:', error);
        throw error;
      }

      if (!data) {
        console.error('[Preview Page] No sweepstakes found for ID:', id);
        throw new Error('Sweepstakes not found');
      }

      console.log('[Preview Page] Fetched sweepstakes data:', data);
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
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load sweepstakes'}
          </AlertDescription>
        </Alert>
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