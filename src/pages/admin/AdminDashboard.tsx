import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash, Eye, Code, BarChart } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isGeneratingBundle, setIsGeneratingBundle] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      console.log("No session, redirecting to auth");
      navigate("/auth");
    }
  }, [session, isLoading, navigate]);

  const { data: sweepstakes, isLoading: isSweepstakesLoading } = useQuery({
    queryKey: ["sweepstakes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sweepstakes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load sweepstakes");
        throw error;
      }

      return data;
    },
  });

  const handleGenerateBundle = async () => {
    setIsGeneratingBundle(true);
    try {
      // Here you would implement the actual bundle generation
      // For now, we'll simulate it with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Widget bundle generated successfully!");
    } catch (err) {
      toast.error("Failed to generate widget bundle");
      console.error(err);
    } finally {
      setIsGeneratingBundle(false);
    }
  };

  const getEmbedCode = (sweepstakesId: string) => {
    const widgetJsUrl = "https://cdn.jsdelivr.net/gh/brianlapp/sweepy-widget-factory@main/public/widget.js";
    return `<div id="sweepstakes-widget" data-sweepstakes-id="${sweepstakesId}"></div>
<script src="${widgetJsUrl}"></script>`;
  };

  const handleCopyEmbed = (sweepstakesId: string) => {
    navigator.clipboard.writeText(getEmbedCode(sweepstakesId));
    toast.success("Embed code copied to clipboard!");
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sweepstakes Dashboard</h1>
        <Button onClick={() => navigate("/admin/sweepstakes/new")}>
          <Plus className="mr-2" />
          New Sweepstakes
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sweepstakes?.map((sweep) => (
              <TableRow key={sweep.id}>
                <TableCell className="font-medium">{sweep.title}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      sweep.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {sweep.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(sweep.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(sweep.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`/preview/${sweep.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/sweepstakes/${sweep.id}/analytics`)}
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Code className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Embed Code</DialogTitle>
                        <DialogDescription>
                          Generate the widget bundle before copying the embed code.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Button 
                          onClick={handleGenerateBundle}
                          disabled={isGeneratingBundle}
                          className="w-full"
                        >
                          {isGeneratingBundle ? "Generating..." : "Generate Widget Bundle"}
                        </Button>
                        <div className="bg-muted p-4 rounded-md">
                          <pre className="text-sm whitespace-pre-wrap break-all">
                            {getEmbedCode(sweep.id)}
                          </pre>
                        </div>
                        <Button 
                          onClick={() => handleCopyEmbed(sweep.id)}
                          disabled={isGeneratingBundle}
                          className="w-full"
                        >
                          Copy Embed Code
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/sweepstakes/${sweep.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this sweepstakes?"
                        )
                      ) {
                        const { error } = await supabase
                          .from("sweepstakes")
                          .delete()
                          .eq("id", sweep.id);

                        if (error) {
                          toast.error("Failed to delete sweepstakes");
                        } else {
                          toast.success("Sweepstakes deleted successfully");
                        }
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}