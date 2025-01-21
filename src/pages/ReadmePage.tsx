import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { uploadReadme } from "@/utils/uploadReadme";

async function fetchReadme() {
  try {
    const { data, error } = await supabase.storage
      .from('static')
      .download('/README.md');
    
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
  const { data: readme, isLoading, error, refetch } = useQuery({
    queryKey: ['readme'],
    queryFn: fetchReadme,
    retry: 1,
    meta: {
      errorMessage: 'Failed to load README content'
    },
    onSettled: (data, error) => {
      if (error) {
        console.error('Query error:', error);
      }
    }
  });

  const handleUpload = async () => {
    try {
      await uploadReadme();
      toast({
        title: "README uploaded",
        description: "The README file has been uploaded successfully.",
      });
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload README file. Please try again.",
      });
      console.error('Upload error:', error);
    }
  };

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
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load README content. The file might not exist yet.
          </AlertDescription>
        </Alert>
        <Button onClick={handleUpload}>Upload README</Button>
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