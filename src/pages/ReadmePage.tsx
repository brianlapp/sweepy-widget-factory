import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const readmeContent = `
# Sweepstakes Widget Factory

A platform for creating and managing sweepstakes widgets that can be embedded on any website.

## Features

- Create and manage sweepstakes campaigns
- Customize widget appearance and behavior
- Track entries and engagement
- Embed widgets on any website
- Integration with BeehiivAPI for subscriber management

## Getting Started

1. Sign in or create an account
2. Create a new sweepstakes from the admin dashboard
3. Customize your widget settings
4. Get the embed code and add it to your website

## Widget Types

- Date-based drawings
- Entry-based drawings with progress tracking
- Custom prize values and entry costs

## Technologies

- React
- Supabase
- Tailwind CSS
- shadcn/ui components
`;

export default function ReadmePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-6 prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown>{readmeContent}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}