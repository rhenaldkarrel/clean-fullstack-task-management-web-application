async function main(): Promise<void> {
  console.log("[seed] No default seed data. Add sample records only when needed.");
}

main().catch((error: unknown) => {
  console.error("[seed] failed", error);
  process.exit(1);
});
