import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Info, Copy, Check, AlertCircle, Activity, Bug } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadWidgetFiles } from '@/utils/uploadWidget';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

interface Version {
  id: string;
  version: string;
  bundle_hash: string;
  is_active: boolean;
  created_at: string;
  deployed_at: string | null;
  changelog: string | null;
}

// Add new countdown configuration
const targetLaunchDate = new Date('2025-02-01T00:00:00Z'); // Set your target launch date

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
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
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
        .limit(5); // Limit to 5 latest versions
      
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

  const getEmbedCode = (sweepstakesId: string) => {
    return `<!-- Sweepstakes Widget Embed Code -->
<div id="sweepstakes-widget" data-sweepstakes-id="${sweepstakesId}"></div>
<script src="https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js"></script>`;
  };

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

    // Remove existing test iframe if any
    if (testIframe) {
      testIframe.remove();
    }

    // Create new test iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e2e8f0';
    iframe.style.borderRadius = '8px';

    // Create container div for widget
    const container = document.createElement('div');
    container.id = 'sweepstakes-widget';
    container.setAttribute('data-sweepstakes-id', testSweepstakesId);

    // Add script tag
    const script = document.createElement('script');
    script.src = `https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js?v=${Date.now()}`;
    
    // Find or create test container
    let testContainer = document.getElementById('widget-test-container');
    if (!testContainer) {
      testContainer = document.createElement('div');
      testContainer.id = 'widget-test-container';
      document.getElementById('widget-test-area')?.appendChild(testContainer);
    }
    
    // Clear and update test container
    testContainer.innerHTML = '';
    testContainer.appendChild(container);
    testContainer.appendChild(script);
    
    setTestIframe(iframe);
    
    // Enhanced message handler for widget iframe
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
    
    // Listen for widget messages
    window.addEventListener('message', (event) => {
      if (event.data.type === 'WIDGET_ERROR') {
        console.error('Widget Error:', event.data.error);
        toast.error(`Widget Error: ${event.data.error.message}`);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '→';
      default:
        return '•';
    }
  };

  if (isLoading) {
    return <div>Loading versions...</div>;
  }

  const activeVersion = versions?.find(v => v.is_active);

  return (
    <div className="space-y-6">
      {/* Countdown Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <CardTitle>Widget Launch Countdown</CardTitle>
            </div>
            <Badge variant="secondary" className="text-lg font-mono">
              {timeUntilLaunch}
            </Badge>
          </div>
          <CardDescription>
            Time remaining until widget goes live on third-party sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Check className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Core Implementation</p>
                  <p className="text-xs text-muted-foreground">Basic widget structure complete</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Check className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Error Handling</p>
                  <p className="text-xs text-muted-foreground">Robust error capture system</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Check className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Storage Integration</p>
                  <p className="text-xs text-muted-foreground">File storage system ready</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Important: Always use the exact embed code provided below. The format of this code is critical for the widget to function correctly.
        </AlertDescription>
      </Alert>

      {/* New Error Monitoring Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bug className="h-5 w-5 text-red-500" />
              <CardTitle>Error Monitoring</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setErrorLogs([])}
            >
              Clear Logs
            </Button>
          </div>
          <CardDescription>
            Real-time error tracking and diagnostics for the widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorLogs.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No errors recorded
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {errorLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      log.type === 'error' ? 'border-red-200 bg-red-50' :
                      log.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge variant={
                        log.type === 'error' ? 'destructive' :
                        log.type === 'warning' ? 'warning' :
                        'default'
                      }>
                        {log.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">{log.message}</p>
                    {log.details && (
                      <pre className="mt-2 text-xs bg-background/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Progress</CardTitle>
          <CardDescription>Current status of widget development phases</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(implementationStatus).map(([phaseKey, phase]) => (
              <AccordionItem value={phaseKey} key={phaseKey}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(phase.status)} variant="secondary">
                      {phase.status}
                    </Badge>
                    <span>{phase.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-4">
                    {Object.entries(phase.items).map(([itemKey, item]) => (
                      <div key={itemKey} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(item.status)} variant="secondary">
                            {item.status}
                          </Badge>
                          <span className="font-medium">{itemKey}</span>
                        </div>
                        <ul className="list-disc pl-6 space-y-1">
                          {item.details.map((detail, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Widget Versions</CardTitle>
            <CardDescription>Manage and deploy widget versions (showing 5 latest)</CardDescription>
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
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                  {getEmbedCode(selectedSweepstakesId)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Testing</CardTitle>
          <CardDescription>Test the widget with different sweepstakes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={testSweepstakesId}
              onChange={(e) => setTestSweepstakesId(e.target.value)}
            >
              <option value="">Select a sweepstakes...</option>
              {sweepstakes?.map((sweep) => (
                <option key={sweep.id} value={sweep.id}>
                  {sweep.title}
                </option>
              ))}
            </select>
            <Button onClick={createTestWidget}>
              Test Widget
            </Button>
          </div>
          
          <div id="widget-test-area" className="min-h-[600px] bg-muted/10 rounded-lg p-4">
            {!testIframe && (
              <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                Select a sweepstakes and click Test Widget to preview
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
