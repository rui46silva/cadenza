import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStaff, canEditContent, canAccessAdmin } from "@/lib/moderation";

/** Qualquer papel com acesso à administração (admin, editor ou moderador). */
export async function requireAdminArea() {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) redirect("/");
  return { session, role: session.user.role, isAdmin: session.user.role === "ADMIN" };
}

/** Moderação da comunidade (admin ou moderador). */
export async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) redirect(session?.user ? "/admin" : "/");
  return { session, isAdmin: session.user.role === "ADMIN" };
}

/** Gestão de conteúdo do CMS (admin ou editor). */
export async function requireContentEditor() {
  const session = await auth();
  if (!session?.user || !canEditContent(session.user.role)) redirect(session?.user ? "/admin" : "/");
  return session;
}

/** Só administradores. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect(session?.user ? "/admin" : "/");
  return session;
}

/** Versão para route handlers: devolve a sessão se o papel for permitido, senão null. */
export async function apiSessionFor(check: (role?: string | null) => boolean) {
  const session = await auth();
  if (!session?.user || !check(session.user.role)) return null;
  return session;
}
