import React from 'react';
import { useParams } from 'react-router-dom';
import { SweepstakesForm } from '@/components/admin/SweepstakesForm';

export function EditSweepstakesPage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {id ? "Edit Sweepstakes" : "Create New Sweepstakes"}
      </h1>
      <SweepstakesForm sweepstakesId={id} />
    </div>
  );
}