import React, { useEffect, useState } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle, Info, Code } from "lucide-react";

export function WidgetTestPage() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [embedCode, setEmbedCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isGeneratingBundle, setIsGeneratingBundle] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  // Get the public URL for the widget
  const widgetJsUrl = `${window.location.origin}/widget.js`;
  const widgetBundleUrl = `${window.location.origin}/widget.bundle.js`;

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
    <script src="${widgetJsUrl}"></script>
    <div>
        <h3>Debug Information:</h3>
        <pre id="debug-output"></pre>
    </div>
</body>
</html>`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'debugLog') {
        setDebugLogs(prev => [...prev, event.data.message]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGenerateBundle = async () => {
    setIsGeneratingBundle(true);
    try {
      // Trigger a build through Vite's development server
      const response = await fetch('/build-widget', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate widget bundle');
      }

      toast.success("Widget bundle generated successfully!");
      setShowEmbedDialog(true);
    } catch (err) {
      toast.error("Failed to generate widget bundle");
      console.error(err);
    } finally {
      setIsGeneratingBundle(false);
    }
  };

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

  useEffect(() => {
    if (!embedCode) {
      setEmbedCode(defaultEmbedCode);
    }
  }, []);

  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Widget Test Environment</h1>
        <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleGenerateBundle} disabled={isGeneratingBundle}>
              <Code className="mr-2 h-4 w-4" />
              {isGeneratingBundle ? "Generating..." : "Get Embed Code"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Widget Embed Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy and paste this code into your website where you want the widget to appear:
              </p>
              <pre className="p-4 bg-slate-100 rounded-lg text-sm overflow-x-auto">
                {`<div id="sweepstakes-widget" data-sweepstakes-id="YOUR_SWEEPSTAKES_ID"></div>
<script src="${widgetJsUrl}"></script>`}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The widget files are served from:
          <pre className="mt-2 bg-slate-100 p-2 rounded">{widgetJsUrl}</pre>
          <pre className="mt-2 bg-slate-100 p-2 rounded">{widgetBundleUrl}</pre>
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