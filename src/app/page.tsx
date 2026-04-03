import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-2">
        <label
          htmlFor="line"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Строка
        </label>
        <Input
          id="line"
          name="line"
          type="text"
          placeholder="Введите текст…"
          autoComplete="off"
        />
      </div>
    </main>
  );
}
