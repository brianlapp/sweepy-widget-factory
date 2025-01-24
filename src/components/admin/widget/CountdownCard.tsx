import React from 'react';
import { Activity, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CountdownCardProps {
  timeUntilLaunch: string;
}

export function CountdownCard({ timeUntilLaunch }: CountdownCardProps) {
  return (
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
  );
}