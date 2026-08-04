-- Regista quando foi enviado o email de confirmação da lista de espera.
ALTER TABLE "WaitlistSignup" ADD COLUMN IF NOT EXISTS "confirmationSentAt" TIMESTAMP(3);
