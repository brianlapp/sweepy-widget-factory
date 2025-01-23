import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Info, Copy, Check, AlertCircle } from 'lucide-react';
import { uploadWidgetFiles } from '@/utils/uploadWidget';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [copied, setCopied] = React.useState(false);
  const [selectedSweepstakesId, setSelectedSweepstakesId] = React.useState('');

  const { data: versions, isLoading } = useQuery({
    queryKey: ['widget-versions'],
    queryFn: async () => {
      console.log('Fetching widget versions...');
      const { data, error } = await supabase
        .from('widget_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log('Fetched versions:', data);
      return data as Version[];
    },
  });

  const { data: sweepstakes } = useQuery({
    queryKey: ['sweepstakes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sweepstakes')
        .select('id, title')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deployMutation = useMutation({
    mutationFn: async (versionId: string) => {
      try {
        console.log('Starting deployment for version:', versionId);
        
        // First build and upload the widget files
        toast.info('Building and uploading widget files...');
        await uploadWidgetFiles();

        // Generate bundle hash
        const bundleResponse = await fetch('/widget.bundle.js');
        const bundleText = await bundleResponse.text();
        const bundleHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(bundleText))
          .then(hash => Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''));

        console.log('Generated bundle hash:', bundleHash);

        // First update the current version to be deployed
        console.log('Updating current version:', versionId);
        const { error: updateError } = await supabase
          .from('widget_versions')
          .update({ 
            deployed_at: new Date().toISOString(),
            bundle_hash: bundleHash,
            is_active: true 
          })
          .eq('id', versionId);

        if (updateError) {
          console.error('Error updating version:', updateError);
          throw updateError;
        }

        // Then deactivate all other versions
        console.log('Deactivating other versions...');
        const { error: deactivateError } = await supabase
          .from('widget_versions')
          .update({ is_active: false })
          .neq('id', versionId);

        if (deactivateError) {
          console.error('Error deactivating other versions:', deactivateError);
          throw deactivateError;
        }

        console.log('Deployment completed successfully');
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

  const getEmbedCode = (sweepstakesId: string) => {
    return `<!-- Add this code right before the closing </head> tag -->
<script src="https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js"></script>

<!-- Add this code where you want the widget to appear -->
<div id="sweepstakes-widget" data-sweepstakes-id="${sweepstakesId}"></div>`;
  };

  const handleCopyCode = async () => {
    if (!selectedSweepstakesId) {
      toast.error('Please select a sweepstakes first');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(getEmbedCode(selectedSweepstakesId));
      setCopied(true);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  if (isLoading) {
    return <div>Loading versions...</div>;
  }

  const activeVersion = versions?.find(v => v.is_active);

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To make your widget available for embedding, follow these steps:
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Create Version" to create a new widget version</li>
            <li>Click "Deploy" on the new version to build and upload the widget files</li>
            <li>Once deployed, select a sweepstakes and copy its embed code</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Widget Versions</CardTitle>
            <CardDescription>Manage and deploy widget versions</CardDescription>
          </div>
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

      {activeVersion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Embed Instructions</CardTitle>
            <CardDescription>Get the code to embed your sweepstakes on any website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Sweepstakes:</label>
              <select 
                className="w-full rounded-md border p-2"
                value={selectedSweepstakesId}
                onChange={(e) => setSelectedSweepstakesId(e.target.value)}
              >
                <option value="">Select a sweepstakes...</option>
                {sweepstakes?.map((sweep) => (
                  <option key={sweep.id} value={sweep.id}>
                    {sweep.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedSweepstakesId && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Embed Code:</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  {getEmbedCode(selectedSweepstakesId)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
