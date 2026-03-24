export default {
	async fetch(request, env) {
	  // Only handle POST requests
	  if (request.method === "POST") {
		try {
		  const { prompt } = await request.json(); // extract "prompt" from JSON body
  
		  if (!prompt) {
			return new Response(JSON.stringify({ error: "Missing 'prompt' field" }), {
			  status: 400,
			  headers: { "Content-Type": "application/json" },
			});
		  }
  
		  // Call the Cloudflare AI
		  const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", { prompt });
  
		  return new Response(JSON.stringify(result), {
			headers: { "Content-Type": "application/json" },
		  });
		} catch (err) {
		  return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		  });
		}
	  }
  
	  // Handle any non-POST requests
	  return new Response("Use a POST request with JSON body: { \"prompt\": \"...\" }", {
		status: 405,
		headers: { "Content-Type": "text/plain" },
	  });
	},
  };