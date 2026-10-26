import SplitLayout from "@/components/common/SplitLayout";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SplitLayout>{children}</SplitLayout>;
}
