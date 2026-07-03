export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-8">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-black/40 dark:text-white/40">
        © {year} Cadenza. Todos os direitos reservados.
      </div>
    </footer>
  );
}
