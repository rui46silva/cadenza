export default function PageLoading() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 py-24">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-accent" />
      </div>
      <p className="text-xs text-black/40 dark:text-white/40">A carregar...</p>
    </div>
  );
}
