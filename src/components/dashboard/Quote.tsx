
import { useQuote } from "@/contexts/QuoteContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Quote = () => {
  const { dailyQuote, isLoading, error } = useQuote();

  if (error) {
    return null;
  }

  return (
    <Card className="bg-secondary/50 border border-border mb-6">
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : (
          <>
            <p className="text-base italic mb-1">{dailyQuote.text}</p>
            <p className="text-sm text-muted-foreground text-right">— {dailyQuote.author}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Quote;
