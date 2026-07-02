export function isDemoHost(hostname: string | null | undefined): boolean {
  return Boolean(hostname?.startsWith("demo.")) || process.env.DEMO_MODE === "true";
}
