export default {
	async fetch(request, env) {
	  if (request.method !== "POST") {
		return new Response(
		  'Use a POST request with JSON body: { "prompt": "...", "mode": "text|image", "model": "...", "width": 1024, "height": 1024 }',
		  { status: 405, headers: { "Content-Type": "text/plain" } }
		);
	  }
  
	  try {
		const { prompt, mode = "text", model, width, height } = await request.json();
  
		if (!prompt) {
		  return new Response(JSON.stringify({ error: "Missing 'prompt' field" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		  });
		}
  
		// ─── TEXT TO TEXT ────────────────────────────────────────────────────────
		if (mode === "text") {
		  const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", { prompt });
		  return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		  });
		}
  
		// ─── TEXT TO IMAGE ───────────────────────────────────────────────────────
		if (mode === "image") {
		  if (!model) {
			return new Response(JSON.stringify({ error: "Missing 'model' field for image mode" }), {
			  status: 400,
			  headers: { "Content-Type": "application/json" },
			});
		  }
  
		  // Helper: convert a ReadableStream → Uint8Array → base64 string
		  async function streamToBase64(stream) {
			const reader = stream.getReader();
			const chunks = [];
			while (true) {
			  const { done, value } = await reader.read();
			  if (done) break;
			  chunks.push(value);
			}
			let totalLength = 0;
			for (const chunk of chunks) totalLength += chunk.length;
			const merged = new Uint8Array(totalLength);
			let offset = 0;
			for (const chunk of chunks) {
			  merged.set(chunk, offset);
			  offset += chunk.length;
			}
			// Convert to base64
			let binary = "";
			for (let i = 0; i < merged.length; i++) {
			  binary += String.fromCharCode(merged[i]);
			}
			return btoa(binary);
		  }
  
		  let base64Image = null;
  
		  switch (model) {
  
			// ── FLUX.1 Schnell ──────────────────────────────────────────────────
			// Returns: JSON { image: "<base64 JPEG>" } — no width/height support
			case "@cf/black-forest-labs/flux-1-schnell": {
			  const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
				prompt,
				steps: 8, // max quality within free tier
			  });
			  base64Image = result.image; // already base64
			  break;
			}
  
			// ── FLUX.2 Klein 4B ─────────────────────────────────────────────────
			// Returns: ReadableStream (PNG). Width/height: 256–1920
			case "@cf/black-forest-labs/flux-2-klein-4b": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/black-forest-labs/flux-2-klein-4b", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			// ── FLUX.2 Klein 9B ─────────────────────────────────────────────────
			// Returns: ReadableStream (PNG). Width/height: 256–1920
			case "@cf/black-forest-labs/flux-2-klein-9b": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/black-forest-labs/flux-2-klein-9b", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			// ── FLUX.2 Dev ──────────────────────────────────────────────────────
			// Returns: base64 JSON. Width/height: 256–1920 (default 1024×768)
			// REQUIRES multipart/form-data — not JSON
			case "@cf/black-forest-labs/flux-2-dev": {
			  const form = new FormData();
			  form.append("prompt", prompt);
			  form.append("width", String(width || 1024));
			  form.append("height", String(height || 768));
  
			  const formRequest = new Request("http://dummy", { method: "POST", body: form });
			  const formContentType = formRequest.headers.get("content-type") || "multipart/form-data";
  
			  const result = await env.AI.run("@cf/black-forest-labs/flux-2-dev", {
				multipart: { body: formRequest.body, contentType: formContentType },
			  });
			  // flux-2-dev returns { image: "<base64>" }
			  base64Image = result.image ?? await streamToBase64(result);
			  break;
			}
  
			// ── SDXL Base 1.0 ───────────────────────────────────────────────────
			// Returns: ReadableStream (PNG). Width/height: 256–2048
			case "@cf/stabilityai/stable-diffusion-xl-base-1.0": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			// ── SDXL Lightning ──────────────────────────────────────────────────
			// Returns: ReadableStream (PNG). Width/height: 256–2048
			case "@cf/bytedance/stable-diffusion-xl-lightning": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/bytedance/stable-diffusion-xl-lightning", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			// ── SD v1.5 img2img ─────────────────────────────────────────────────
			// Returns: ReadableStream (PNG). Width/height: best 512–768
			case "@cf/runwayml/stable-diffusion-v1-5-img2img": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/runwayml/stable-diffusion-v1-5-img2img", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			// ── SD v1.5 Inpainting ──────────────────────────────────────────────
			// Returns: ReadableStream (PNG). Width/height: best 512–768
			case "@cf/runwayml/stable-diffusion-v1-5-inpainting": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/runwayml/stable-diffusion-v1-5-inpainting", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			// ── Leonardo Phoenix 1.0 ────────────────────────────────────────────
			case "@cf/leonardo-ai/phoenix-1.0": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/leonardo-ai/phoenix-1.0", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			// ── Leonardo Lucid Origin ───────────────────────────────────────────
			case "@cf/leonardo-ai/lucid-origin": {
			  const params = { prompt };
			  if (width) params.width = Number(width);
			  if (height) params.height = Number(height);
			  const stream = await env.AI.run("@cf/leonardo-ai/lucid-origin", params);
			  base64Image = await streamToBase64(stream);
			  break;
			}
  
			default:
			  return new Response(JSON.stringify({ error: `Unknown image model: "${model}"` }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			  });
		  }
  
		  // All models now return a unified base64 response
		  return new Response(JSON.stringify({ image: base64Image }), {
			headers: { "Content-Type": "application/json" },
		  });
		}
  
		return new Response(JSON.stringify({ error: `Unknown mode: "${mode}"` }), {
		  status: 400,
		  headers: { "Content-Type": "application/json" },
		});
  
	  } catch (err) {
		return new Response(JSON.stringify({ error: err.message }), {
		  status: 500,
		  headers: { "Content-Type": "application/json" },
		});
	  }
	},
  };