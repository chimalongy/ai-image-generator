import { NextResponse } from "next/server";

const WORKER_URL = "https://image-gen-worker.geniusdomainnames.workers.dev/ask";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Missing 'prompt' field" }, { status: 400 });
    }

    const workerRes = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!workerRes.ok) {
      const errorText = await workerRes.text();
      return NextResponse.json(
        { error: `Worker error: ${errorText}` },
        { status: workerRes.status }
      );
    }

    const data = await workerRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[generate-image] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
