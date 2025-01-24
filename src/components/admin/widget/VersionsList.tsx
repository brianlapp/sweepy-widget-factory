import React from 'react';
import { Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Version {
  id: string;
  version: string;
  bundle_hash: string;
  is_active: boolean;
  created_at: string;
  deployed_at: string | null;
  changelog: string | null;
}

interface VersionsListProps {
  versions: Version[] | undefined;
  isCreating: boolean;
  isDeploying: boolean;
  onCreateVersion: () => void;
  onDeployVersion: (versionId: string) => void;
}

export function VersionsList({ 
  versions, 
  isCreating, 
  isDeploying, 
  onCreateVersion, 
  onDeployVersion 
}: VersionsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Widget Versions</CardTitle>
          <CardDescription>Manage and deploy widget versions (showing 5 latest)</CardDescription>
        </div>
        <Button 
          size="sm" 
          onClick={onCreateVersion}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Version'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!versions || versions.length === 0 ? (
          <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
            <Info className="mr-2 h-4 w-4" />
            No versions found
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => (
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
                    onClick={() => {
                      if (!version.is_active) {
                        toast.info('Starting deployment...');
                        onDeployVersion(version.id);
                      }
                    }}
                    disabled={version.is_active || isDeploying}
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deploying...
                      </>
                    ) : version.is_active ? (
                      'Deployed'
                    ) : (
                      'Deploy'
                    )}
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