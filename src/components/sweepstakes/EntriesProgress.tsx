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
  const percentage = Math.round(progress);
  
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="bg-green-100 rounded-lg p-4 dark:bg-green-900/20">
          <span className="text-4xl font-bold text-green-600 dark:text-green-400">
            {percentage}%
          </span>
        </div>
        <Progress value={progress} className="h-3 flex-1" />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{currentEntries} of {entriesToDraw} entries</span>
        <span>{valueLeft} left to win {formatCurrency(prizeValue)}</span>
      </div>
    </div>
  );
}