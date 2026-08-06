import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FriendsScreen from "@/components/FriendsScreen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "friendsPage.metadata" });
  return { title: t("title"), description: t("description") };
}

export default function FriendsPage() {
  return <FriendsScreen />;
}
