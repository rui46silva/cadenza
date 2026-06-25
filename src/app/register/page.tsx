"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Music2, Award } from "lucide-react";
import { event } from "@/lib/gtag";
import { buttonPrimary } from "@/lib/ui";
import { getPasswordStrength } from "@/lib/passwordStrength";
import InstrumentInput from "@/components/InstrumentInput";

const STRENGTH_STYLES = {
  fraca: { width: "w-1/3", color: "bg-red-500", text: "text-red-500" },
  média: { width: "w-2/3", color: "bg-amber-500", text: "text-amber-500" },
  forte: { width: "w-full", color: "bg-green-500", text: "text-green-500" },
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ALUNO" | "PROFESSOR" | "MUSICO_PROFISSIONAL">("ALUNO");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [instrument, setInstrument] = useState("");
  const [verificationNote, setVerificationNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const needsVerification = role === "PROFESSOR" || role === "MUSICO_PROFISSIONAL";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As passwords não coincidem.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password,
      role,
      instrument: instrument || undefined,
      verificationNote: needsVerification ? verificationNote : undefined,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const fieldError = data?.details?.fieldErrors?.verificationNote?.[0];
      setError(fieldError ?? data?.error ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    event("sign_up", { method: "credentials", role: payload.role });

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/forum");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-10">
      <h1 className="text-xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="name"
          placeholder="Nome"
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        <div>
          <input
            name="password"
            type="password"
            placeholder="Password (mín. 8 caracteres)"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
          {strength && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className={`h-1 rounded-full transition-all ${STRENGTH_STYLES[strength].width} ${STRENGTH_STYLES[strength].color}`}
                />
              </div>
              <span className={`text-xs ${STRENGTH_STYLES[strength].text}`}>
                {strength}
              </span>
            </div>
          )}
        </div>
        <div>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmar password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
          {passwordsMismatch && (
            <p className="mt-1 text-xs text-red-500">As passwords não coincidem.</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRole("ALUNO")}
            className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-sm transition-colors ${
              role === "ALUNO"
                ? "border-accent text-accent bg-accent/10"
                : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
            }`}
          >
            <GraduationCap className="h-5 w-5" />
            Sou aluno
          </button>
          <button
            type="button"
            onClick={() => setRole("PROFESSOR")}
            className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-sm transition-colors ${
              role === "PROFESSOR"
                ? "border-accent text-accent bg-accent/10"
                : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
            }`}
          >
            <Music2 className="h-5 w-5" />
            Sou professor
          </button>
          <button
            type="button"
            onClick={() => setRole("MUSICO_PROFISSIONAL")}
            className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-sm transition-colors ${
              role === "MUSICO_PROFISSIONAL"
                ? "border-accent text-accent bg-accent/10"
                : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
            }`}
          >
            <Award className="h-5 w-5" />
            Músico profissional
          </button>
        </div>

        <InstrumentInput name="instrument" value={instrument} onChange={setInstrument} />

        {needsVerification && (
          <div>
            <textarea
              name="verificationNote"
              required
              minLength={30}
              maxLength={1000}
              rows={3}
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              placeholder={
                role === "PROFESSOR"
                  ? "Conta-nos a tua experiência como professor: escola/conservatório, certificações, anos de ensino, redes sociais ou portefólio com aulas/atuações..."
                  : "Conta-nos a tua experiência como músico profissional: orquestra/banda, agência, certificações, redes sociais ou portefólio com atuações/gravações..."
              }
              className="w-full rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
            />
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Contas de professor e músico profissional ficam pendentes de verificação por um admin.
              Esta informação ajuda a confirmar que é mesmo verídico.
            </p>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={
            loading ||
            passwordsMismatch ||
            (needsVerification && verificationNote.trim().length < 30)
          }
          className={`${buttonPrimary} disabled:opacity-50`}
        >
          {loading ? "A criar..." : "Criar conta"}
        </button>
      </form>
      <p className="text-sm mt-3 text-black/60 dark:text-white/60">
        Já tens conta?{" "}
        <Link href="/login" className="underline">
          Entra
        </Link>
      </p>
    </div>
  );
}
