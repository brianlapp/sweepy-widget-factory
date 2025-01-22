import React, { useEffect, useState } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle, Info, Code, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WidgetVersionManager } from "@/components/admin/WidgetVersionManager";

// Constants
const PROJECT_ID = "xrycgmzgskcbhvdclflj";
const STORAGE_URL = `https://${PROJECT_ID}.supabase.co/storage/v1/object/public/static`;

export function WidgetTestPage() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [embedCode, setEmbedCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isGeneratingBundle, setIsGeneratingBundle] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{[key: string]: boolean}>({});

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
    <script src="${STORAGE_URL}/widget.js"></script>
    <div>
        <h3>Debug Information:</h3>
        <pre id="debug-output"></pre>
    </div>
</body>
</html>`;

  useEffect(() => {
    if (!embedCode) {
      setEmbedCode(defaultEmbedCode);
    }
  }, []);

  const uploadFile = async (fileName: string, content: string, contentType: string = 'text/javascript') => {
    try {
      setUploadStatus(prev => ({ ...prev, [fileName]: false }));
      
      const blob = new Blob([content], { type: contentType });
      const { error: uploadError } = await supabase.storage
        .from('static')
        .upload(fileName, blob, { 
          upsert: true,
          contentType 
        });

      if (uploadError) throw uploadError;
      
      setUploadStatus(prev => ({ ...prev, [fileName]: true }));
      return true;
    } catch (err) {
      console.error(`Error uploading ${fileName}:`, err);
      toast.error(`Failed to upload ${fileName}`);
      return false;
    }
  };

  const handleUploadWidgetFiles = async () => {
    setIsUploading(true);
    try {
      // Upload widget.js
      const widgetJsResponse = await fetch('/widget.js');
      const widgetJs = await widgetJsResponse.text();
      await uploadFile('widget.js', widgetJs);

      // Upload widget.css
      const widgetCssResponse = await fetch('/widget.css');
      const widgetCss = await widgetCssResponse.text();
      await uploadFile('widget.css', widgetCss, 'text/css');

      // Upload widget.bundle.js
      const widgetBundleResponse = await fetch('/widget.bundle.js');
      const widgetBundle = await widgetBundleResponse.text();
      await uploadFile('widget.bundle.js', widgetBundle);

      const allUploaded = Object.values(uploadStatus).every(status => status);
      if (allUploaded) {
        toast.success("All widget files uploaded successfully!");
      } else {
        toast.error("Some files failed to upload. Please try again.");
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error("Failed to upload widget files");
    } finally {
      setIsUploading(false);
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
        <Button 
          onClick={handleUploadWidgetFiles} 
          disabled={isUploading}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Widget Files"}
        </Button>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The widget files are served from:
          <pre className="mt-2 bg-slate-100 p-2 rounded">{STORAGE_URL}</pre>
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