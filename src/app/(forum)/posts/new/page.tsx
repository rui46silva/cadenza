import { prisma } from "@/lib/prisma";
import { expertWhere } from "@/lib/experts";
import NewPostForm from "@/components/NewPostForm";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ duvida?: string; para?: string }>;
}) {
  const { duvida, para } = await searchParams;

  // Resolve o destinatário no servidor para validar que é mesmo um especialista
  // (e para mostrar o nome/instrumento sem confiar no URL).
  const directedTo = para
    ? await prisma.user.findFirst({
        where: { AND: [{ id: para }, expertWhere] },
        select: {
          id: true,
          name: true,
          role: true,
          instrument: true,
          avatarUrl: true,
          verificationStatus: true,
          isAmbassador: true,
        },
      })
    : null;

  return (
    <NewPostForm
      initialQuestion={duvida === "1" || Boolean(directedTo)}
      directedTo={directedTo}
    />
  );
}
