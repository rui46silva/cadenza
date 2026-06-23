"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CommentForm from "@/components/CommentForm";
import RoleBadge from "@/components/RoleBadge";

export type CommentNode = {
  id: string;
  content: string;
  isDeleted: boolean;
  authorId: string;
  author: {
    name: string;
    role: string;
    instrument: string | null;
    verificationStatus: string | null;
  };
  children: CommentNode[];
};

export default function CommentItem({
  postId,
  comment,
  currentUserId,
  currentUserRole,
}: {
  postId: string;
  comment: CommentNode;
  currentUserId?: string;
  currentUserRole?: string;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete =
    !comment.isDeleted &&
    (comment.authorId === currentUserId || currentUserRole === "ADMIN");

  async function handleDelete() {
    if (!confirm("Eliminar este comentário?")) return;
    setDeleting(true);
    await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
    setDeleting(false);
    router.refresh();
  }

  return (
    <li className="rounded-lg border border-black/10 dark:border-white/10 p-3">
      {comment.isDeleted ? (
        <p className="text-sm italic text-black/40 dark:text-white/40">
          [comentário eliminado]
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <RoleBadge user={comment.author} />
          </div>
          <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>

          {currentUserId && (
            <div className="mt-2 flex gap-3 text-xs">
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-black/50 dark:text-white/50 hover:underline"
              >
                {replying ? "Cancelar" : "Responder"}
              </button>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-rose-500 hover:underline disabled:opacity-50"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}

          {replying && (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                autoFocus
                onPosted={() => setReplying(false)}
              />
            </div>
          )}
        </>
      )}

      {comment.children.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2 border-l border-black/10 dark:border-white/10 pl-3">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              postId={postId}
              comment={child}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
