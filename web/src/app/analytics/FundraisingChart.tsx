import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { group__id: string; total: number }[];
  title: string;
}

export default function FundraisingChart({ data, title }: Props) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="chart">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="group__id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
