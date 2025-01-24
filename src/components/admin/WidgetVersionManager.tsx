import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadWidgetFiles } from '@/utils/uploadWidget';

// Import components
import { CountdownCard } from './widget/CountdownCard';
import { ErrorMonitoringCard } from './widget/ErrorMonitoringCard';
import { ImplementationProgress } from './widget/ImplementationProgress';
import { VersionsList } from './widget/VersionsList';
import { EmbedInstructions } from './widget/EmbedInstructions';
import { WidgetTesting } from './widget/WidgetTesting';

// Implementation status tracking with production verification completed
const implementationStatus = {
  phase1: {
    title: "Phase 1: Bundle Configuration",
    status: "completed",
    items: {
      "Build Output": {
        status: "completed",
        details: ["widget-bundle.js confirmed", "No HTML in bundle", "Correct file structure", "MIME types verified"]
      },
      "Dependencies": {
        status: "in-progress",
        details: ["React bundling needs verification", "External modules check pending", "Bundle size optimization needed"]
      }
    }
  },
  phase2: {
    title: "Phase 2: Load Sequence",
    status: "in-progress",
    items: {
      "Initialization": {
        status: "in-progress",
        details: ["iframe creation ✓", "Script injection needs review", "React init failing", "Handshake partial"]
      },
      "Resource Loading": {
        status: "pending",
        details: ["Missing resources", "Load order issues", "Completion tracking needed", "Path verification done"]
      }
    }
  },
  phase3: {
    title: "Phase 3: Error Management",
    status: "completed",
    items: {
      "Error Tracking": {
        status: "completed",
        details: ["Logging implemented ✓", "Status reporting active ✓", "Boundaries in place ✓", "Retries working ✓"]
      },
      "Recovery": {
        status: "completed",
        details: ["Graceful degradation ✓", "User feedback ✓", "Cleanup handlers ✓", "State reset ✓"]
      }
    }
  },
  phase4: {
    title: "Phase 4: Connection Flow",
    status: "in-progress",
    items: {
      "Script Loading": {
        status: "partial",
        details: ["Parent script ✓", "iframe creation ✓", "Widget init failing", "React mount failing"]
      },
      "Component Rendering": {
        status: "pending",
        details: ["Form not rendering", "State management pending", "Event handlers pending", "UI feedback needed"]
      }
    }
  }
};

// Add new countdown configuration
const targetLaunchDate = new Date('2025-02-01T00:00:00Z');

const getEmbedCode = (sweepstakesId: string) => {
  return `<!-- Sweepstakes Widget Embed Code -->
<div id="sweepstakes-widget" data-sweepstakes-id="${sweepstakesId}"></div>
<script src="https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js"></script>`;
};

export function WidgetVersionManager() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = React.useState(false);
  const [selectedSweepstakesId, setSelectedSweepstakesId] = React.useState('');
  const [testSweepstakesId, setTestSweepstakesId] = React.useState('');
  const [testIframe, setTestIframe] = React.useState<HTMLIFrameElement | null>(null);
  const [timeUntilLaunch, setTimeUntilLaunch] = React.useState('');
  const [errorLogs, setErrorLogs] = React.useState<Array<{
    timestamp: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    details?: any;
  }>>([]);

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetLaunchDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilLaunch('Launch time!');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilLaunch(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const handleCopyCode = async () => {
    const code = getEmbedCode(selectedSweepstakesId);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Embed code copied to clipboard');
  };

  const createTestWidget = () => {
    if (!testSweepstakesId) {
      toast.error('Please select a sweepstakes to test');
      return;
    }

    if (testIframe) {
      testIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e2e8f0';
    iframe.style.borderRadius = '8px';

    const container = document.createElement('div');
    container.id = 'sweepstakes-widget';
    container.setAttribute('data-sweepstakes-id', testSweepstakesId);

    const script = document.createElement('script');
    script.src = `https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js?v=${Date.now()}`;
    
    let testContainer = document.getElementById('widget-test-container');
    if (!testContainer) {
      testContainer = document.createElement('div');
      testContainer.id = 'widget-test-container';
      document.getElementById('widget-test-area')?.appendChild(testContainer);
    }
    
    testContainer.innerHTML = '';
    testContainer.appendChild(container);
    testContainer.appendChild(script);
    
    setTestIframe(iframe);
    
    const handleWidgetMessage = (event: MessageEvent) => {
      if (event.data.type === 'WIDGET_ERROR') {
        console.error('Widget Error:', event.data.error);
        setErrorLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: event.data.error.message,
          type: 'error',
          details: event.data.error
        }]);
        toast.error(`Widget Error: ${event.data.error.message}`);
      } else if (event.data.type === 'WIDGET_WARNING') {
        setErrorLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: event.data.message,
          type: 'warning'
        }]);
      } else if (event.data.type === 'WIDGET_INFO') {
        setErrorLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: event.data.message,
          type: 'info'
        }]);
      }
    };

    window.addEventListener('message', handleWidgetMessage);
  };

  if (isLoading) {
    return <div>Loading versions...</div>;
  }

  const activeVersion = versions?.find(v => v.is_active);

  return (
    <div className="space-y-6">
      <CountdownCard timeUntilLaunch={timeUntilLaunch} />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Important: Always use the exact embed code provided below. The format of this code is critical for the widget to function correctly.
        </AlertDescription>
      </Alert>

      <ErrorMonitoringCard 
        errorLogs={errorLogs}
        onClearLogs={() => setErrorLogs([])}
      />

      <ImplementationProgress implementationStatus={implementationStatus} />

      <VersionsList
        versions={versions}
        isCreating={isCreating}
        isDeploying={isDeploying}
        onCreateVersion={() => createVersion()}
        onDeployVersion={(versionId) => deployVersion(versionId)}
      />

      {activeVersion && (
        <EmbedInstructions
          activeVersion={!!activeVersion}
          selectedSweepstakesId={selectedSweepstakesId}
          sweepstakes={sweepstakes}
          copied={copied}
          onSweepstakesSelect={setSelectedSweepstakesId}
          onCopyCode={handleCopyCode}
        />
      )}

      <WidgetTesting
        sweepstakes={sweepstakes}
        testSweepstakesId={testSweepstakesId}
        testIframe={testIframe}
        onSweepstakesSelect={setTestSweepstakesId}
        onTestWidget={createTestWidget}
      />
    </div>
  );
}