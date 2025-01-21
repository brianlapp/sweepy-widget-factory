import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users } from "lucide-react";
import { toast } from "sonner";

export function SweepstakesAnalyticsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: sweepstakes } = useQuery({
    queryKey: ['sweepstakes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: entries, refetch: refetchEntries } = useQuery({
    queryKey: ['sweepstakes-entries', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes_entries')
        .select('*')
        .eq('sweepstakes_id', id);
      
      if (error) throw error;
      return data;
    },
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

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl font-bold">Sweepstakes Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span className="text-muted-foreground">{new Date(entry.created_at!).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}