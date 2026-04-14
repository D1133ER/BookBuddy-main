
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { createHoverLift } from "@/lib/motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  accentColor?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  trend,
  className,
  accentColor = "bg-primary/10",
}: StatCardProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div whileHover={createHoverLift(shouldReduceMotion, -5)}>
      <Card
        className={cn(
          "overflow-hidden hover:shadow-md transition-all border-t-4",
          accentColor.replace("/10", "/80").replace("bg-", "border-"),
          className,
        )}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
              {trend && (
                <div className="flex items-center mt-2">
                  <span
                    className={cn(
                      "text-xs font-medium flex items-center",
                      trend.isPositive ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {trend.isPositive ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 01-1 1H9v9a1 1 0 01-2 0V8H5a1 1 0 110-2h12a1 1 0 01.707 1.707l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 015 6h12a1 1 0 011 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 13a1 1 0 01-1-1V3a1 1 0 112 0v9h2a1 1 0 110 2H5a1 1 0 01-.707-1.707l5-5a1 1 0 011.414 0l5 5A1 1 0 0115 14H3a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    since last month
                  </span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-full", accentColor)}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
