import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface UserDistributionChartProps {
  title?: string;
  totalLabel?: string;
  data?: Array<{
    label: string;
    value: number;
    color: string;
    hoverColor: string;
    bgColor: string;
    textColor: string;
  }>;
}

const defaultChartData = [
  {
    label: 'Pending',
    value: 1,
    color: 'fill-amber-500',
    hoverColor: 'fill-amber-600',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  {
    label: 'Active',
    value: 1,
    color: 'fill-blue-500',
    hoverColor: 'fill-blue-600',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  {
    label: 'Completed',
    value: 1,
    color: 'fill-green-500',
    hoverColor: 'fill-green-600',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  {
    label: 'Cancelled',
    value: 0,
    color: 'fill-rose-500',
    hoverColor: 'fill-rose-600',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-700',
  },
];

const UserDistributionChart = ({
  title = 'Request Breakdown',
  totalLabel = 'Requests',
  data = [],
}: UserDistributionChartProps) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const chartData = data.length > 0 ? data : defaultChartData;

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <Users className="h-5 w-5 mr-2 text-green-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-md"
              role="img"
              aria-label={`${title}: ${chartData.map((d) => `${d.label} ${d.value}`).join(', ')}`}
            >
              {chartData.reduce((jsx, item, index, array) => {
                const previousTotal = array.slice(0, index).reduce((sum, i) => sum + i.value, 0);
                const startAngle = (previousTotal / total) * 360;
                const endAngle = ((previousTotal + item.value) / total) * 360;

                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`,
                ].join(' ');

                // Calculate midpoint angle for label positioning
                const midAngle = (startAngle + endAngle) / 2;
                const labelX = 50 + 60 * Math.cos((midAngle * Math.PI) / 180);
                const labelY = 50 + 60 * Math.sin((midAngle * Math.PI) / 180);

                return [
                  ...jsx,
                  <g key={index}>
                    <path
                      d={pathData}
                      className={`${hoveredSegment === index ? item.hoverColor : item.color} transition-colors duration-200 cursor-pointer`}
                      onMouseEnter={() => setHoveredSegment(index)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    ></path>
                    {item.value >= 15 && (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-white text-[8px] font-bold pointer-events-none"
                      >
                        {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                      </text>
                    )}
                  </g>,
                ];
              }, [] as React.ReactElement[])}
              <circle cx="50" cy="50" r="25" className="fill-white drop-shadow-sm"></circle>
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] font-medium fill-gray-600"
              >
                {total} {totalLabel}
              </text>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {chartData.map((item, index) => (
            <div
              key={index}
              className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${hoveredSegment === index ? item.bgColor : 'hover:bg-gray-50'}`}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className={`w-4 h-4 rounded-full ${item.color.replace('fill-', 'bg-')} mr-3 shadow-sm`}
              ></div>
              <div>
                <p
                  className={`text-sm font-medium ${hoveredSegment === index ? item.textColor : ''}`}
                >
                  {item.label}
                </p>
                <p className="text-sm text-muted-foreground flex items-center space-x-1">
                  <span className="font-semibold">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                  <span>•</span>
                  <span>{item.value} total</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(UserDistributionChart);
