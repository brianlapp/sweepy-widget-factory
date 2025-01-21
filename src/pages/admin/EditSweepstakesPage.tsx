import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "@/components/auth/AuthProvider";
import { SweepstakesForm } from '@/components/admin/SweepstakesForm';

export function EditSweepstakesPage() {
  const { id } = useParams<{ id: string }>();
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/auth");
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="container py-6">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {id ? "Edit Sweepstakes" : "Create New Sweepstakes"}
      </h1>
      <SweepstakesForm sweepstakesId={id} />
    </div>
  );
}