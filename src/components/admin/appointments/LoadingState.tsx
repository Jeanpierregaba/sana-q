
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex justify-center py-10">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
