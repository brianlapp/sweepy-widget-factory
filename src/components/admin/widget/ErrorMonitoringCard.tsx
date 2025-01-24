import React from 'react';
import { Bug } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ErrorLog {
  timestamp: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: any;
}

interface ErrorMonitoringCardProps {
  errorLogs: ErrorLog[];
  onClearLogs: () => void;
}

export function ErrorMonitoringCard({ errorLogs, onClearLogs }: ErrorMonitoringCardProps) {
  return (
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
            onClick={onClearLogs}
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
                      log.type === 'warning' ? 'outline' :
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
  );
}