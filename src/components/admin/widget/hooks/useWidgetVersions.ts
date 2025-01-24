import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadWidgetFiles } from '@/utils/uploadWidget';

export interface Version {
  id: string;
  version: string;
  bundle_hash: string;
  is_active: boolean;
  created_at: string;
  deployed_at: string | null;
  changelog: string | null;
}

export function useWidgetVersions() {
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: ['widget-versions'],
    queryFn: async () => {
      console.log('[Widget Versions] Fetching versions...');
      const { data, error } = await supabase
        .from('widget_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('[Widget Versions] Error fetching versions:', error);
        throw error;
      }
      console.log('[Widget Versions] Fetched versions:', data);
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
        
        toast.info('Building and uploading widget files...');
        const uploadResult = await uploadWidgetFiles();
        
        if (!uploadResult.success || !uploadResult.bundleHash) {
          console.error('[Widget Deploy] Upload failed:', uploadResult.error);
          throw new Error(`Upload failed: ${uploadResult.error}`);
        }

        console.log('[Widget Deploy] Files uploaded successfully, bundle hash:', uploadResult.bundleHash);

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

  return {
    versions,
    isLoading,
    createVersion,
    isCreating,
    deployVersion,
    isDeploying
  };
}