import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export function WidgetTestPage() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [embedCode, setEmbedCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
</head>
<body>
    <div id="sweepstakes-widget" data-sweepstakes-id="YOUR_SWEEPSTAKES_ID"></div>
    <script src="${window.location.origin}/widget.js"></script>
    <div id="debug-info" style="margin-top: 20px; padding: 10px; background: #f0f0f0;">
        <h3>Debug Information:</h3>
        <pre id="debug-output"></pre>
    </div>
    <script>
        // Debug logging
        const debugOutput = document.getElementById('debug-output');
        function log(message) {
            console.log(message);
            debugOutput.textContent += message + '\\n';
        }

        // Monitor widget initialization
        window.addEventListener('load', () => {
            log('Page loaded');
            const widget = document.getElementById('sweepstakes-widget');
            log('Widget element found: ' + !!widget);
            log('Sweepstakes ID: ' + (widget?.getAttribute('data-sweepstakes-id') || 'not set'));
        });
    </script>
</body>
</html>`;

  const handleTest = () => {
    setError(null);
    setIframeKey(prev => prev + 1);
    
    // Create a blob URL from the embed code
    const blob = new Blob([embedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
    
    toast.success("Test environment refreshed");
  };

  const handleReset = () => {
    setEmbedCode(defaultEmbedCode);
    setError(null);
    toast.info("Embed code reset to default");
  };

  useEffect(() => {
    if (!embedCode) {
      setEmbedCode(defaultEmbedCode);
    }
  }, []);

  // Handle iframe load errors
  const handleIframeError = () => {
    setError("Failed to load the preview. Check the embed code for errors.");
  };

  // Handle iframe messages from the test environment
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'widget-error') {
        setError(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">Widget Test Environment</h1>
      
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
                  ref={iframeRef}
                  key={iframeKey}
                  className="w-full h-[600px]"
                  title="Widget Test Environment"
                  onError={handleIframeError}
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