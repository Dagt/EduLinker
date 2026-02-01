import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { group: string; total: number }[];
  title: string;
}

export default function ComplaintsChart({ data, title }: Props) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="chart">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="group" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
