import SplitLayout from "@/components/common/SplitLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SplitLayout>{children}</SplitLayout>;
}
