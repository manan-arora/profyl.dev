"use client";

export default function TestPage() {
  async function test() {
    const res = await fetch("/api/sync/github", {
      method: "POST",
    });

    console.log(await res.json());
  }

  return (
    <main className="p-24">
      <button
        onClick={test}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Test GitHub Sync
      </button>
    </main>
  );
}