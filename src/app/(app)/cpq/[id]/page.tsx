/**
 * CPQ Quote Detail page
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasAppAccess } from "@/lib/app-access";
import { CpqQuoteDetail } from "@/components/cpq/CpqQuoteDetail";

export default async function CpqQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/opai/login?callbackUrl=/cpq/${id}`);
  }

  if (!hasAppAccess(session.user.role, "cpq")) {
    redirect("/hub");
  }

  return <CpqQuoteDetail quoteId={id} />;
}
