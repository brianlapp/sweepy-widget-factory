import { useEffect } from "react";
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
import { Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/auth");
    }
  }, [session, navigate]);

  const { data: sweepstakes, isLoading } = useQuery({
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

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
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
                <TableCell className="text-right">
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