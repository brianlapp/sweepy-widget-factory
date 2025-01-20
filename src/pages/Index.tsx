import { SweepstakesWidget } from "@/components/SweepstakesWidget";

export default function Index() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Sweepstakes Entry</h1>
      <SweepstakesWidget sweepstakesId="default" />
    </div>
  );
}