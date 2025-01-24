import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ImplementationStatus {
  [key: string]: {
    title: string;
    status: string;
    items: {
      [key: string]: {
        status: string;
        details: string[];
      };
    };
  };
}

interface ImplementationProgressProps {
  implementationStatus: ImplementationStatus;
}

export function ImplementationProgress({ implementationStatus }: ImplementationProgressProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementation Progress</CardTitle>
        <CardDescription>Current status of widget development phases</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(implementationStatus).map(([phaseKey, phase]) => (
            <AccordionItem value={phaseKey} key={phaseKey}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(phase.status)} variant="secondary">
                    {phase.status}
                  </Badge>
                  <span>{phase.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-4">
                  {Object.entries(phase.items).map(([itemKey, item]) => (
                    <div key={itemKey} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)} variant="secondary">
                          {item.status}
                        </Badge>
                        <span className="font-medium">{itemKey}</span>
                      </div>
                      <ul className="list-disc pl-6 space-y-1">
                        {item.details.map((detail, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}