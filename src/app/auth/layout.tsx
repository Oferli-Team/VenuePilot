import { Section } from "@/components/ui/section";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Section className="h-screen max-w-full px-0">{children}</Section>;
}
