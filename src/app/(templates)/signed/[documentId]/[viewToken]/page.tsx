import { SignedViewClient } from "@/components/docs/SignedViewClient";

export default async function SignedDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string; viewToken: string }>;
}) {
  const { documentId, viewToken } = await params;
  return <SignedViewClient documentId={documentId} viewToken={viewToken} />;
}
