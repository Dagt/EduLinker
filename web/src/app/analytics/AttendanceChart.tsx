import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: {
    group_id: number;
    attending_yes: number;
    attending_no: number;
    attending_maybe: number;
    participation_rate: number;
  }[];
  title: string;
}

export default function AttendanceChart({ data, title }: Props) {
  return (
    <section>
      <h3>{title}</h3>
      <div style={{ height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
            <XAxis dataKey="group_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="attending_yes" stackId="a" fill="#22c55e" name="YES" />
            <Bar dataKey="attending_maybe" stackId="a" fill="#fbbf24" name="MAYBE" />
            <Bar dataKey="attending_no" stackId="a" fill="#ef4444" name="NO" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
