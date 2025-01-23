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

// IMPORTANT: This is the source of truth for the widget embed code format.
// Any changes to this format must be carefully considered and documented.
const STORAGE_URL = 'https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static';

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
      console.log('[Widget Versions] Fetching versions...');
      const { data, error } = await supabase
        .from('widget_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('[Widget Versions] Error fetching versions:', error);
        throw error;
      }
      console.log('[Widget Versions] Fetched versions:', data);
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

  const generateUniqueVersion = () => {
    const now = new Date();
    const timestamp = now.getTime();
    return `${process.env.VITE_APP_VERSION || '1.0.0'}-${timestamp}`;
  };

  const { mutate: createVersion, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      const uniqueVersion = generateUniqueVersion();
      console.log('[Widget Version Create] Creating version:', uniqueVersion);
      
      const { data, error } = await supabase
        .from('widget_versions')
        .insert({
          version: uniqueVersion,
          bundle_hash: 'pending',
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-versions'] });
      toast.success('New widget version created');
    },
    onError: (error) => {
      console.error('[Widget Version Create] Error:', error);
      toast.error(`Failed to create widget version: ${error.message}`);
    },
  });

  const { mutate: deployVersion, isPending: isDeploying } = useMutation({
    mutationFn: async (versionId: string) => {
      try {
        console.log('[Widget Deploy] Starting deployment for version:', versionId);
        
        // First build and upload the widget files
        toast.info('Building and uploading widget files...');
        const uploadResult = await uploadWidgetFiles();
        
        if (!uploadResult.success || !uploadResult.bundleHash) {
          console.error('[Widget Deploy] Upload failed:', uploadResult.error);
          throw new Error(`Upload failed: ${uploadResult.error}`);
        }

        console.log('[Widget Deploy] Files uploaded successfully, bundle hash:', uploadResult.bundleHash);

        // Call the deploy_widget_version function
        const { error: updateError } = await supabase.rpc('deploy_widget_version', {
          p_version_id: versionId,
          p_bundle_hash: uploadResult.bundleHash
        });

        if (updateError) {
          console.error('[Widget Deploy] Database update failed:', updateError);
          throw updateError;
        }

        console.log('[Widget Deploy] Version deployed successfully');
        return { success: true };
      } catch (error) {
        console.error('[Widget Deploy] Deployment failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-versions'] });
      toast.success('Widget version deployed successfully');
    },
    onError: (error) => {
      console.error('[Widget Deploy] Deployment error:', error);
      toast.error(`Failed to deploy widget version: ${error.message}`);
    },
  });

  const handleCopyCode = async () => {
    const code = getEmbedCode(selectedSweepstakesId);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Embed code copied to clipboard');
  };

  // This function returns the official embed code format.
  // Any changes here must be carefully reviewed and documented.
  const getEmbedCode = (sweepstakesId: string) => {
    return `<div id="sweepstakes-widget" data-sweepstakes-id="${sweepstakesId}"></div>
<script src="${STORAGE_URL}/widget.js"></script>`;
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
          Important: Always use the exact embed code provided below. The format of this code is critical for the widget to function correctly.
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
            onClick={() => createVersion()}
            disabled={isCreating}
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
                      onClick={() => deployVersion(version.id)}
                      disabled={version.is_active || isDeploying}
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
