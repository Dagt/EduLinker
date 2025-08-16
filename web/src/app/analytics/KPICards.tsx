interface KPI {
  label: string;
  value: number;
}

interface Props {
  items: KPI[];
}

export default function KPICards({ items }: Props) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {items.map((kpi) => (
        <div
          key={kpi.label}
          style={{
            flex: 1,
            textAlign: "center",
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: 8,
          }}
        >
          <strong>{kpi.value}</strong>
          <p>{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}
