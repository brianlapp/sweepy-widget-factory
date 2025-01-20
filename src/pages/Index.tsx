import { SweepstakesWidget } from "@/components/SweepstakesWidget";

export default function Index() {
  return (
    <div className="container mx-auto py-8">
      <SweepstakesWidget 
        sweepstakesId="default"
        title="Win Amazing Prizes!"
        imageUrl="/placeholder.svg"
        disclaimer="No purchase necessary. Void where prohibited. Must be 18 or older to enter."
      />
    </div>
  );
}