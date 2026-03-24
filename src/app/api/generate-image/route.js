import { NextResponse } from "next/server";

const WORKER_URL = "https://image-gen-worker.geniusdomainnames.workers.dev/ask";

export async function POST(request) {
  try {
    const { prompt, mode = "text", model, width, height } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Missing 'prompt' field" }, { status: 400 });
    }

    const workerRes = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode, model, width, height }),
    });

    // Always parse JSON — worker now returns { image: "<base64>" } for images
    // and { response: "..." } for text. Errors also come back as JSON.
    const data = await workerRes.json();

    if (!workerRes.ok) {
      return NextResponse.json(
        { error: data.error || "Worker error" },
        { status: workerRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[generate-image] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}