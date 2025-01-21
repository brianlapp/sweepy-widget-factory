import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

async function fetchReadme() {
  try {
    const { data, error } = await supabase.storage
      .from('static')
      .download('README.md');
    
    if (error) {
      console.error('Storage error:', error);
      throw error;
    }
    
    const text = await data.text();
    return text;
  } catch (error) {
    console.error('Error fetching README:', error);
    throw error;
  }
}

export default function ReadmePage() {
  const { toast } = useToast();
  const { data: readme, isLoading, error } = useQuery({
    queryKey: ['readme'],
    queryFn: fetchReadme,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error loading README",
        description: "Please try uploading the README file first.",
      });
      console.error('Query error:', error);
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load README content. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-6 prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{readme || ''}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}