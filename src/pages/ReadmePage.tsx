import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import readme from "../../README.md?raw";

export default function ReadmePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-6 prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{readme}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}