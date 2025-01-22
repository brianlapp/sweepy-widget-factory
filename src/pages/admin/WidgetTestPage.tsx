import React, { useEffect, useState } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";

// Constants for GitHub repository details
const GITHUB_REPO = 'brianlapp/sweepy-widget-factory';
const GITHUB_BRANCH = 'main';

export function WidgetTestPage() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [embedCode, setEmbedCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Use jsDelivr URLs for the widget files
  const widgetUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/public/widget.js`;
  const widgetBundleUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/public/widget.bundle.js`;

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/auth");
    }
  }, [session, isLoading, navigate]);

  const defaultEmbedCode = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Widget Test</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 20px; }
        #debug-output { 
            margin-top: 20px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div id="sweepstakes-widget" data-sweepstakes-id="YOUR_SWEEPSTAKES_ID"></div>
    <script src="${widgetUrl}"></script>
    <div>
        <h3>Debug Information:</h3>
        <pre id="debug-output"></pre>
    </div>
    <script>
        console.log('Page loaded.');
        console.log('Starting widget initialization test...');
        
        const widget = document.getElementById('sweepstakes-widget');
        const sweepstakesId = widget.getAttribute('data-sweepstakes-id');
        console.log('Sweepstakes ID found:', sweepstakesId);
        
        function handleError(error) {
            console.error(error);
            const debugOutput = document.getElementById('debug-output');
            if (debugOutput) {
                debugOutput.textContent += '\\nError: ' + error;
            }
            window.parent.postMessage({
                type: 'debugLog',
                message: 'Error: ' + error
            }, '*');
        }

        window.onerror = function(msg, url, line, col, error) {
            handleError(\`\${msg} at \${url}:\${line}:\${col}\`);
            return false;
        };

        window.addEventListener('message', function(event) {
            if (event.data.type === 'widgetLog') {
                window.parent.postMessage({
                    type: 'debugLog',
                    message: event.data.message
                }, '*');
            }
        });
    </script>
</body>
</html>`;

  useEffect(() => {
    if (!embedCode) {
      setEmbedCode(defaultEmbedCode);
    }
  }, []);

  const handleTest = () => {
    setError(null);
    setDebugLogs([]);
    setIframeKey(prev => prev + 1);
    
    try {
      const blob = new Blob([embedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = url;
      }
      
      toast.success("Test environment refreshed");
    } catch (err) {
      setError(`Failed to create test environment: ${err instanceof Error ? err.message : String(err)}`);
      toast.error("Failed to refresh test environment");
    }
  };

  const handleReset = () => {
    setEmbedCode(defaultEmbedCode);
    setError(null);
    setDebugLogs([]);
    toast.info("Embed code reset to default");
  };

  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">Widget Test Environment</h1>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The widget files must be publicly accessible via GitHub. 
          They will be available at:
          <pre className="mt-2 bg-slate-100 p-2 rounded">{widgetUrl}</pre>
          <pre className="mt-2 bg-slate-100 p-2 rounded">{widgetBundleUrl}</pre>
          <p className="mt-2">
            Note: You'll need to update these URLs with your actual GitHub repository details.
          </p>
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex space-x-2">
                <Button onClick={handleTest}>Test Widget</Button>
                <Button variant="outline" onClick={handleReset}>Reset Code</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-slate-100 p-4 rounded-lg text-sm overflow-auto max-h-[200px]">
                {debugLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="bg-white rounded-lg overflow-hidden border">
                <iframe
                  key={iframeKey}
                  className="w-full h-[600px]"
                  title="Widget Test Environment"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
