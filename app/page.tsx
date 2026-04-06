import { Calculator } from "@/components/calculator/Calculator";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950 px-3 py-8 sm:px-6 overflow-x-hidden">
      <Calculator />
    </main>
  );
}
