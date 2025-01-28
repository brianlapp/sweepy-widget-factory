import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  console.log('[Preview Page] Initializing with ID:', id);

  const { data: sweepstakes, isLoading, error } = useQuery({
    queryKey: ['sweepstakes', id],
    queryFn: async () => {
      console.log('[Preview Page] Starting data fetch for ID:', id);
      if (!id) throw new Error('No sweepstakes ID provided');
      
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('[Preview Page] Database error:', error);
        throw error;
      }

      if (!data) {
        console.error('[Preview Page] No data found for ID:', id);
        throw new Error('Sweepstakes not found');
      }

      console.log('[Preview Page] Successfully fetched data:', data);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    console.log('[Preview Page] Loading state...');
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !sweepstakes) {
    console.error('[Preview Page] Error state:', error);
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

  console.log('[Preview Page] Rendering sweepstakes:', sweepstakes);
  return (
    <div className="container mx-auto py-8">
      <iframe
        src={`/embed/${sweepstakes.id}`}
        className="w-full min-h-[600px] border-0"
        title="Sweepstakes Preview"
      />
    </div>
  );
}