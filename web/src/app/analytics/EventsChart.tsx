import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { scope: string; total: number }[];
  title: string;
  colors?: string[];
}

export default function EventsChart({ data, title, colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"] }: Props) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="chart">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="scope" label>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
