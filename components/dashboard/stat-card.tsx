import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardDescription>{title}</CardDescription>
      <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </Card>
  );
}
