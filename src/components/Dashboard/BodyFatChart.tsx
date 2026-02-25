import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface BodyFatChartProps {
    data: { tuan: string; bodyFat?: number }[];
}

export function BodyFatChart({ data }: BodyFatChartProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                    dataKey="tuan"
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
                    formatter={(v) => [`${v}%`, 'Body Fat']}
                />
                <ReferenceLine y={15} stroke="#ffb800" strokeDasharray="4 2" strokeOpacity={0.5} />
                <ReferenceLine y={10} stroke="#00ff88" strokeDasharray="4 2" strokeOpacity={0.5} />
                <Line
                    type="monotone"
                    dataKey="bodyFat"
                    stroke="#4a9eff"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#4a9eff', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#4a9eff' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
