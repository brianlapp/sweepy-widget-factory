import React from 'react';
import { Check, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Sweepstakes {
  id: string;
  title: string;
}

interface EmbedInstructionsProps {
  activeVersion: boolean;
  selectedSweepstakesId: string;
  sweepstakes: Sweepstakes[] | undefined;
  copied: boolean;
  onSweepstakesSelect: (id: string) => void;
  onCopyCode: () => void;
}

export function EmbedInstructions({
  activeVersion,
  selectedSweepstakesId,
  sweepstakes,
  copied,
  onSweepstakesSelect,
  onCopyCode,
}: EmbedInstructionsProps) {
  const getEmbedCode = (sweepstakesId: string) => {
    return `<!-- Sweepstakes Widget Embed Code -->
<div id="sweepstakes-widget" data-sweepstakes-id="${sweepstakesId}"></div>
<script src="https://xrycgmzgskcbhvdclflj.supabase.co/storage/v1/object/public/static/widget.js"></script>`;
  };

  if (!activeVersion) return null;

  return (
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
            onChange={(e) => onSweepstakesSelect(e.target.value)}
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
                onClick={onCopyCode}
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
  );
}