export default function SectionTitle({
  eyebrow,
  title,
  children,
  center = true,
}) {
  return (
    <div className={`section-heading ${center ? "center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p className="lead">{children}</p>}
      <div className="gold-line" />
    </div>
  );
}
