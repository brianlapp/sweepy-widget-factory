import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { ProgressTheme } from "./types";

interface EntriesProgressProps {
  currentEntries: number;
  entriesToDraw: number;
  entryValue: number;
  prizeValue: number;
  theme?: ProgressTheme;
}

const themeStyles = {
  green: {
    bg: 'from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30',
    border: 'border-green-100 dark:border-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    button: 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300',
    progress: 'bg-green-100 dark:bg-green-950/50',
    gradient: 'linear-gradient(90deg, rgb(134, 239, 172), rgb(59, 130, 246))'
  },
  blue: {
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    border: 'border-blue-100 dark:border-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    button: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    progress: 'bg-blue-100 dark:bg-blue-950/50',
    gradient: 'linear-gradient(90deg, rgb(96, 165, 250), rgb(99, 102, 241))'
  },
  orange: {
    bg: 'from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30',
    border: 'border-orange-100 dark:border-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    button: 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300',
    progress: 'bg-orange-100 dark:bg-orange-950/50',
    gradient: 'linear-gradient(90deg, rgb(251, 146, 60), rgb(251, 191, 36))'
  }
};

export function EntriesProgress({ 
  currentEntries, 
  entriesToDraw,
  entryValue,
  prizeValue,
  theme = 'green'
}: EntriesProgressProps) {
  const totalEntriesNeeded = Math.ceil(prizeValue / entryValue);
  const progress = Math.min((currentEntries / totalEntriesNeeded) * 100, 100);
  const entriesLeft = Math.max(totalEntriesNeeded - currentEntries, 0);
  const percentage = Math.round(progress);
  const styles = themeStyles[theme];
  
  return (
    <div className="space-y-2 animate-fade-in">
      <div className={`relative p-3 rounded-lg bg-gradient-to-r ${styles.bg} border ${styles.border}`}>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className={`text-sm font-semibold ${styles.text}`}>
            Prize Draw Progress
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className={`transition-colors ${styles.button}`}>
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
          <div className={`bg-gradient-to-br ${styles.bg} rounded-md p-1.5 shadow-lg`}>
            <span className="text-xl font-bold text-white">
              {percentage}%
            </span>
          </div>
          <div className="flex-1">
            <Progress 
              value={progress} 
              className={`h-2.5 ${styles.progress}`}
              style={{
                backgroundImage: styles.gradient,
                backgroundSize: `${progress}% 100%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>

        <p className={`text-center text-xs font-medium ${styles.text}`}>
          {entriesLeft} entries left until the prize draw!
        </p>
      </div>
    </div>
  );
}