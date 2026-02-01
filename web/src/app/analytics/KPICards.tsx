interface KPI {
  label: string;
  value: number;
}

interface Props {
  items: KPI[];
}

export default function KPICards({ items }: Props) {
  return (
    <div className="kpi-grid">
      {items.map((kpi) => (
        <div key={kpi.label} className="kpi-card">
          <strong>{kpi.value}</strong>
          <span className="meta">{kpi.label}</span>
        </div>
      ))}
    </div>
  );
}
