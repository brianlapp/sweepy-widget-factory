import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
  // Calculate total entries needed based on prize value and entry value
  const totalEntriesNeeded = Math.ceil(prizeValue / entryValue);
  const progress = Math.min((currentEntries / totalEntriesNeeded) * 100, 100);
  const entriesLeft = Math.max(totalEntriesNeeded - currentEntries, 0);
  const percentage = Math.round(progress);
  
  return (
    <div className="space-y-2 animate-fade-in">
      <div className="relative p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border border-green-100 dark:border-green-900/30">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-300">
            Prize Draw Progress
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The prize will be drawn when {totalEntriesNeeded} entries are reached! Enter daily to increase your chances.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-md p-1.5 shadow-lg shadow-green-500/20 dark:from-green-600 dark:to-emerald-700">
            <span className="text-xl font-bold text-white">
              {percentage}%
            </span>
          </div>
          <div className="flex-1">
            <Progress 
              value={progress} 
              className="h-2.5 bg-green-100 dark:bg-green-950/50"
              style={{
                backgroundImage: 'linear-gradient(90deg, rgb(134, 239, 172), rgb(59, 130, 246))',
                backgroundSize: `${progress}% 100%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>

        <p className="text-center text-xs font-medium text-green-700 dark:text-green-300">
          {entriesLeft} entries left until the prize draw!
        </p>
      </div>
    </div>
  );
}