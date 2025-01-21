import { SweepstakesWidget } from "@/components/SweepstakesWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: sweepstakes, isLoading } = useQuery({
    queryKey: ['active-sweepstakes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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