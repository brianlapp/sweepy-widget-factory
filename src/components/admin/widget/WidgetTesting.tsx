import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Sweepstakes {
  id: string;
  title: string;
}

interface WidgetTestingProps {
  sweepstakes: Sweepstakes[] | undefined;
  testSweepstakesId: string;
  testIframe: HTMLIFrameElement | null;
  onSweepstakesSelect: (id: string) => void;
  onTestWidget: () => void;
}

export function WidgetTesting({
  sweepstakes,
  testSweepstakesId,
  testIframe,
  onSweepstakesSelect,
  onTestWidget,
}: WidgetTestingProps) {
  return (
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
            onChange={(e) => onSweepstakesSelect(e.target.value)}
          >
            <option value="">Select a sweepstakes...</option>
            {sweepstakes?.map((sweep) => (
              <option key={sweep.id} value={sweep.id}>
                {sweep.title}
              </option>
            ))}
          </select>
          <Button onClick={onTestWidget}>
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
  );
}