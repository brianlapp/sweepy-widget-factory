import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import components
import { CountdownCard } from './widget/CountdownCard';
import { ErrorMonitoringCard } from './widget/ErrorMonitoringCard';
import { ImplementationProgress } from './widget/ImplementationProgress';
import { VersionsList } from './widget/VersionsList';
import { EmbedInstructions } from './widget/EmbedInstructions';
import { WidgetTesting } from './widget/WidgetTesting';

// Import hooks
import { useWidgetVersions } from './widget/hooks/useWidgetVersions';
import { useEmbedCode } from './widget/hooks/useEmbedCode';
import { useWidgetTesting } from './widget/hooks/useWidgetTesting';

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
        status: "completed",
        details: ["React bundling verified", "External modules checked", "Bundle size optimized"]
      }
    }
  },
  phase2: {
    title: "Phase 2: Load Sequence",
    status: "completed",
    items: {
      "Initialization": {
        status: "completed",
        details: ["iframe creation ✓", "Script injection verified", "React init fixed", "Handshake completed"]
      },
      "Resource Loading": {
        status: "completed",
        details: ["Resources loaded ✓", "Load order fixed", "Completion tracking added", "Path verification done"]
      }
    }
  },
  phase3: {
    title: "Phase 3: Error Management",
    status: "in-progress",
    items: {
      "Error Tracking": {
        status: "completed",
        details: ["Logging implemented ✓", "Status reporting active ✓", "Boundaries in place ✓", "Retries working ✓"]
      },
      "Recovery": {
        status: "in-progress",
        details: ["Graceful degradation pending", "User feedback needed", "Cleanup handlers ✓", "State reset pending"]
      }
    }
  },
  phase4: {
    title: "Phase 4: Connection Flow",
    status: "pending",
    items: {
      "Script Loading": {
        status: "partial",
        details: ["Parent script ✓", "iframe creation ✓", "Widget init pending", "React mount pending"]
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

export function WidgetVersionManager() {
  const [timeUntilLaunch, setTimeUntilLaunch] = React.useState('');
  const { versions, isLoading, createVersion, isCreating, deployVersion, isDeploying } = useWidgetVersions();
  const { copied, selectedSweepstakesId, setSelectedSweepstakesId, handleCopyCode } = useEmbedCode();
  const { 
    testSweepstakesId, 
    setTestSweepstakesId, 
    testIframe, 
    errorLogs, 
    setErrorLogs, 
    createTestWidget 
  } = useWidgetTesting();

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
