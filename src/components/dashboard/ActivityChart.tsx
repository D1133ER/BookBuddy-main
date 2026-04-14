
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users } from "lucide-react";

interface ActivityChartProps {
  title?: string;
  data?: Array<{
    month: string;
    value: number;
    color?: string;
  }>;
  totalExchanges?: number;
  approvalRate?: number;
  activeThreads?: number;
}

const ActivityChart = ({
  title = "Your Monthly Activity",
  data = [],
  totalExchanges = 0,
  approvalRate = 0,
  activeThreads = 0,
}: ActivityChartProps) => {
  const chartData = data.length > 0
    ? data.map((item, index) => ({
        ...item,
        color:
          item.color ||
          (index >= Math.max(0, data.length - 2)
            ? "from-indigo-400 to-indigo-600"
            : "from-blue-400 to-blue-600"),
      }))
    : [
        { month: "Jan", value: 0, color: "from-slate-300 to-slate-400" },
        { month: "Feb", value: 0, color: "from-slate-300 to-slate-400" },
        { month: "Mar", value: 0, color: "from-slate-300 to-slate-400" },
        { month: "Apr", value: 0, color: "from-slate-300 to-slate-400" },
        { month: "May", value: 0, color: "from-slate-300 to-slate-400" },
        { month: "Jun", value: 0, color: "from-slate-300 to-slate-400" },
      ];
  const maxValue = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <Card className="border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2 pt-4 px-2">
          {chartData.map((item, index) => {
            const isHighest =
              item.value === Math.max(...chartData.map((d) => d.value));
            const isLowest =
              item.value === Math.min(...chartData.map((d) => d.value));

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group"
              >
                <div className="relative w-full">
                  {isHighest && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Peak
                    </div>
                  )}
                  <div
                    className={`w-full bg-gradient-to-t ${item.color} rounded-t-md group-hover:shadow-lg transition-all duration-200 ${isHighest ? "ring-2 ring-green-400 ring-opacity-50" : ""} ${isLowest ? "ring-2 ring-red-400 ring-opacity-50" : ""}`}
                    style={{ height: `${Math.max(18, (item.value / maxValue) * 180)}px` }}
                  ></div>
                </div>
                <div className="w-full text-center mt-2 relative">
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.month}
                  </span>
                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {item.value} exchanges
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div className="text-center bg-blue-50 p-3 rounded-lg flex flex-col items-center">
            <div className="bg-blue-100 p-2 rounded-full mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{totalExchanges}</p>
            <p className="text-sm text-blue-600">Total Exchanges</p>
          </div>
          <div className="text-center bg-indigo-50 p-3 rounded-lg flex flex-col items-center">
            <div className="bg-indigo-100 p-2 rounded-full mb-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-700">{approvalRate}%</p>
            <p className="text-sm text-indigo-600">Approval Rate</p>
          </div>
          <div className="text-center bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <div className="bg-purple-100 p-2 rounded-full mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700">{activeThreads}</p>
            <p className="text-sm text-purple-600">Active Threads</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
