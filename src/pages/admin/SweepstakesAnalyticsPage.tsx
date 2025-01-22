import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export function SweepstakesAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [showInactive, setShowInactive] = useState(true);

  // Fetch all sweepstakes for the list view
  const { data: allSweepstakes, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-sweepstakes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch current sweepstakes details
  const { data: sweepstakes, isLoading: isLoadingSweepstakes } = useQuery({
    queryKey: ['sweepstakes', id],
    queryFn: async () => {
      if (!id) throw new Error("No sweepstakes ID provided");
      
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch entries for current sweepstakes
  const { data: entries, refetch: refetchEntries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['sweepstakes-entries', id],
    queryFn: async () => {
      if (!id) throw new Error("No sweepstakes ID provided");

      const { data, error } = await supabase
        .from('sweepstakes_entries')
        .select('*')
        .eq('sweepstakes_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const pickWinner = async () => {
    if (!entries?.length) {
      toast.error("No entries to pick from!");
      return;
    }

    // Reset any previous winners
    const { error: resetError } = await supabase
      .from('sweepstakes_entries')
      .update({ is_winner: false })
      .eq('sweepstakes_id', id);

    if (resetError) {
      toast.error("Failed to reset previous winners");
      return;
    }

    // Randomly select a winner
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[randomIndex];

    const { error: updateError } = await supabase
      .from('sweepstakes_entries')
      .update({ is_winner: true })
      .eq('id', winner.id);

    if (updateError) {
      toast.error("Failed to update winner");
      return;
    }

    await refetchEntries();
    toast.success(`Winner selected: ${winner.first_name} ${winner.last_name}`);
  };

  const currentWinner = entries?.find(entry => entry.is_winner);

  const filteredSweepstakes = allSweepstakes?.filter(sweep => 
    showInactive ? true : sweep.is_active
  );

  if (!id) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sweepstakes Analytics</h1>
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "Hide Inactive" : "Show All"}
          </Button>
        </div>

        {isLoadingAll ? (
          <div>Loading sweepstakes...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Draw Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSweepstakes?.map((sweep) => (
                  <TableRow key={sweep.id} className={!sweep.is_active ? "opacity-60" : ""}>
                    <TableCell>
                      {sweep.is_active ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{sweep.title}</TableCell>
                    <TableCell>{sweep.current_entries || 0}</TableCell>
                    <TableCell>{format(new Date(sweep.start_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(sweep.end_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="capitalize">{sweep.draw_type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }

  if (isLoadingSweepstakes || isLoadingEntries) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl font-bold">Sweepstakes Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Winner</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWinner ? (
                `${currentWinner.first_name} ${currentWinner.last_name}`
              ) : (
                "No winner selected"
              )}
            </div>
            <Button 
              onClick={pickWinner}
              className="mt-4"
              variant="outline"
            >
              Pick New Winner
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sweepstakes?.is_active ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-gray-600">Inactive</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Ends: {sweepstakes?.end_date ? format(new Date(sweepstakes.end_date), 'MMM d, yyyy') : 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries?.slice(0, 5).map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted"
              >
                <span>{entry.first_name} {entry.last_name}</span>
                <span className="text-muted-foreground">
                  {format(new Date(entry.created_at!), 'MMM d, yyyy')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}