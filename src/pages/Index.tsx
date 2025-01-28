import { SweepstakesWidget } from "@/components/SweepstakesWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: sweepstakes, isLoading, error } = useQuery({
    queryKey: ['active-sweepstakes'],
    queryFn: async () => {
      console.log('Fetching active sweepstakes...');
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sweepstakes:', error);
        throw error;
      }
      console.log('Fetched sweepstakes:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-[600px] w-full max-w-md mx-auto" />
      </div>
    );
  }

  if (error) {
    console.error('Error in Index component:', error);
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500">Error loading sweepstakes. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!sweepstakes?.length) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-muted-foreground">No active sweepstakes available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue={sweepstakes[0].id} className="max-w-md mx-auto">
        <TabsList className="w-full mb-4 h-auto flex-wrap gap-2">
          {sweepstakes.map((sweep) => (
            <TabsTrigger 
              key={sweep.id} 
              value={sweep.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {sweep.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {sweepstakes.map((sweep) => (
          <TabsContent key={sweep.id} value={sweep.id}>
            <SweepstakesWidget 
              sweepstakesId={sweep.id}
              title={sweep.title}
              imageUrl={sweep.image_url || "/placeholder.svg"}
              disclaimer={sweep.description}
              thankYouHeadline={sweep.thank_you_headline}
              thankYouImageUrl={sweep.thank_you_image_url}
              trackingUrl={sweep.tracking_url}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}