import { prisma } from "@/lib/prisma";
import { expertWhere } from "@/lib/experts";
import { currentChallenge } from "@/lib/challenges";
import NewPostForm from "@/components/NewPostForm";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ duvida?: string; para?: string; feedback?: string; desafio?: string }>;
}) {
  const { duvida, para, feedback, desafio } = await searchParams;
  const challenge = desafio === "1" ? currentChallenge() : null;

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
          gender: true,
          avatarUrl: true,
          verificationStatus: true,
          isAmbassador: true,
        },
      })
    : null;

  return (
    <NewPostForm
      initialQuestion={duvida === "1" || Boolean(directedTo)}
      initialFeedback={feedback === "1"}
      directedTo={directedTo}
      challenge={challenge ? { title: challenge.title, prompt: challenge.prompt } : null}
    />
  );
}
