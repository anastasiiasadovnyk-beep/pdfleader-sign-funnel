export type ExampleRowProps = { label: string };

export default function ExampleRow({ label }: ExampleRowProps) {
  return <p className="text-body text-text-secondary">{label}</p>;
}
