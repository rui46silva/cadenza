import { prisma } from "@/lib/prisma";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import NewPostForm from "@/components/NewPostForm";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ duvida?: string; para?: string }>;
}) {
  const { duvida, para } = await searchParams;

  // Resolve o professor destinatário no servidor para validar que é mesmo
  // um verificado (e para mostrar o nome sem confiar no URL).
  const directedTo = para
    ? await prisma.user.findFirst({
        where: {
          id: para,
          role: { in: [...VERIFIABLE_ROLES] },
          verificationStatus: "APPROVED",
        },
        select: { id: true, name: true },
      })
    : null;

  return (
    <NewPostForm
      initialQuestion={duvida === "1" || Boolean(directedTo)}
      directedTo={directedTo}
    />
  );
}
