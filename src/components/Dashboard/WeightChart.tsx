import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface WeightChartProps {
    data: { ngay: string; canNang: number }[];
}

export function WeightChart({ data }: WeightChartProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                    dataKey="ngay"
                    tick={{ fill: '#555', fontSize: 11 }}
                    axisLine={{ stroke: '#222' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#555', fontSize: 11 }}
                    axisLine={{ stroke: '#222' }}
                    tickLine={false}
                    domain={['auto', 'auto']}
                />
                <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#f0f0f0', fontSize: 12 }}
                    labelStyle={{ color: '#888' }}
                    formatter={(v) => [`${v} kg`, 'Cân nặng']}
                />
                <Line
                    type="monotone"
                    dataKey="canNang"
                    stroke="#00ff88"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#00ff88', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#00ff88' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
