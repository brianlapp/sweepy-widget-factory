import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { uploadWidgetFiles } from '@/utils/uploadWidget';

interface Version {
  id: string;
  version: string;
  bundle_hash: string;
  is_active: boolean;
  created_at: string;
  deployed_at: string | null;
  changelog: string | null;
}

export function WidgetVersionManager() {
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: ['widget-versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('widget_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Version[];
    },
  });

  const deployMutation = useMutation({
    mutationFn: async (versionId: string) => {
      try {
        // First upload the widget files
        await uploadWidgetFiles();

        // Generate bundle hash
        const bundleResponse = await fetch('/widget.bundle.js');
        const bundleText = await bundleResponse.text();
        const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(bundleText))
          .then(hash => Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));

        // Update version record
        const { error } = await supabase
          .from('widget_versions')
          .update({ 
            deployed_at: new Date().toISOString(),
            bundle_hash: bundleHash,
            is_active: true 
          })
          .eq('id', versionId);

        if (error) throw error;

        // Deactivate other versions
        const { error: deactivateError } = await supabase
          .from('widget_versions')
          .update({ is_active: false })
          .neq('id', versionId);

        if (deactivateError) throw deactivateError;
      } catch (error) {
        console.error('Deployment error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-versions'] });
      toast.success('Widget version deployed successfully');
    },
    onError: (error) => {
      console.error('Deployment error:', error);
      toast.error('Failed to deploy widget version');
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: async () => {
      const version = new Date().toISOString().split('T')[0] + '-' + 
                     Math.random().toString(36).substring(2, 7);
      
      const { data, error } = await supabase
        .from('widget_versions')
        .insert({
          version,
          bundle_hash: 'pending',
          changelog: 'Initial version'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-versions'] });
      toast.success('New version created');
    },
    onError: (error) => {
      console.error('Version creation error:', error);
      toast.error('Failed to create new version');
    },
  });

  if (isLoading) {
    return <div>Loading versions...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Widget Versions</CardTitle>
        <Button 
          size="sm" 
          onClick={() => createVersionMutation.mutate()}
          disabled={createVersionMutation.isPending}
        >
          Create Version
        </Button>
      </CardHeader>
      <CardContent>
        {versions?.length === 0 ? (
          <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
            <Info className="mr-2 h-4 w-4" />
            No versions found
          </div>
        ) : (
          <div className="space-y-2">
            {versions?.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{version.version}</span>
                  {version.is_active && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={version.is_active ? "secondary" : "default"}
                    onClick={() => deployMutation.mutate(version.id)}
                    disabled={version.is_active || deployMutation.isPending}
                  >
                    {version.is_active ? 'Deployed' : 'Deploy'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}