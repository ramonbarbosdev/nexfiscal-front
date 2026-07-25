type StatItem = {
  label: string;
  value: string | number;
  highlight?: boolean;
};

type StatsStripProps = {
  items: StatItem[];
};

export function StatsStrip({ items }: StatsStripProps) {
  return (
    <section className="nf-stat-strip mb-6 sm:mb-8">
      {items.map((item) => (
        <div key={item.label} className="nf-stat-item">
          <p className="nf-stat-label">{item.label}</p>
          <p className={item.highlight ? "nf-stat-value nf-stat-value--accent" : "nf-stat-value"}>
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}
