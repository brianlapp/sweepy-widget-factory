import { supabase } from '@/integrations/supabase/client';

export async function uploadWidgetFiles() {
  try {
    // Upload embed.html
    const embedHtmlResponse = await fetch('/embed.html');
    const embedHtmlBlob = await embedHtmlResponse.blob();
    const { error: embedError } = await supabase.storage
      .from('static')
      .upload('embed.html', embedHtmlBlob, {
        contentType: 'text/html',
        upsert: true
      });
    
    if (embedError) throw embedError;
    console.log('Successfully uploaded embed.html');

    // Upload widget.js
    const widgetJsResponse = await fetch('/widget.js');
    const widgetJsBlob = await widgetJsResponse.blob();
    const { error: widgetError } = await supabase.storage
      .from('static')
      .upload('widget.js', widgetJsBlob, {
        contentType: 'application/javascript',
        upsert: true
      });

    if (widgetError) throw widgetError;
    console.log('Successfully uploaded widget.js');

    // Upload widget bundle
    const widgetBundleResponse = await fetch('/widget.bundle.js');
    const widgetBundleBlob = await widgetBundleResponse.blob();
    const { error: bundleError } = await supabase.storage
      .from('static')
      .upload('widget.bundle.js', widgetBundleBlob, {
        contentType: 'application/javascript',
        upsert: true
      });

    if (bundleError) throw bundleError;
    console.log('Successfully uploaded widget.bundle.js');

  } catch (error) {
    console.error('Error uploading widget files:', error);
    throw error;
  }
}