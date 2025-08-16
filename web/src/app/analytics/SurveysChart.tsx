import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { group_id: string; total: number }[];
  title: string;
}

export default function SurveysChart({ data, title }: Props) {
  return (
    <section>
      <h3>{title}</h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="group_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
