import React, { useEffect, useState } from 'react';
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function WidgetTestPage() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [embedCode, setEmbedCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0); // Used to force iframe refresh

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/auth");
    }
  }, [session, isLoading, navigate]);

  const handleTest = () => {
    setIframeKey(prev => prev + 1); // Force iframe refresh
    toast.success("Test environment refreshed");
  };

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
</body>
</html>`;

  const handleReset = () => {
    setEmbedCode(defaultEmbedCode);
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg overflow-hidden border">
                <iframe
                  key={iframeKey}
                  srcDoc={embedCode}
                  className="w-full h-[600px]"
                  title="Widget Test Environment"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}