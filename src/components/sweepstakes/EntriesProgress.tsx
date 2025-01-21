import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface EntriesProgressProps {
  currentEntries: number;
  entriesToDraw: number;
  entryValue: number;
  prizeValue: number;
}

export function EntriesProgress({ 
  currentEntries, 
  entriesToDraw,
  entryValue,
  prizeValue 
}: EntriesProgressProps) {
  const progress = Math.min((currentEntries / entriesToDraw) * 100, 100);
  const entriesLeft = Math.max(entriesToDraw - currentEntries, 0);
  const valueLeft = formatCurrency(entriesLeft * entryValue);
  
  return (
    <div className="space-y-2 animate-fade-in">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{currentEntries} of {entriesToDraw} entries</span>
        <span>{valueLeft} left to win {formatCurrency(prizeValue)}</span>
      </div>
    </div>
  );
}