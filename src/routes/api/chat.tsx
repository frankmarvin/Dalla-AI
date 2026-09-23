import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

type ChatRequestBody = {
  messages?: unknown;
  mode?: string;
};

const MODE_PROMPTS: Record<string, string> = {
  chat: `
Answer helpfully, accurately and clearly.

Use markdown when useful.

Do not invent facts.

If you are uncertain, say so.

Keep normal answers reasonably concise unless the user requests detail.
`,

  code: `
You are a senior software engineer.

Provide correct, secure and runnable code.

Use fenced code blocks with the correct language.

Explain important implementation details briefly.

Do not invent APIs, packages or libraries.

When debugging, identify the actual cause before proposing changes.
`,

  write: `
You are an expert writer and editor.

Produce polished, natural and well-structured writing.

Match the user's requested tone and audience.

Preserve the user's intended meaning.

Do not add unsupported facts.
`,

  research: `
You are a rigorous research assistant.

Separate facts from assumptions.

Clearly identify uncertainty.

Do not fabricate sources, citations or statistics.

Structure complex answers with useful headings.

When current information is required, clearly state when information needs verification.
`,
};

function jsonError(message: string, status: number) {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        "content-type": "application/json",
      },
    },
  );
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body =
            (await request.json()) as ChatRequestBody;

          if (!Array.isArray(body.messages)) {
            return jsonError(
              "Messages are required.",
              400,
            );
          }

          const apiKey =
            process.env.OPENAI_API_KEY;

          if (!apiKey) {
            console.error(
              "OPENAI_API_KEY is not configured.",
            );

            return jsonError(
              "Dalla AI is not configured yet. Add OPENAI_API_KEY to the server environment.",
              500,
            );
          }

          const openai = createOpenAI({
            apiKey,
          });

          const mode =
            typeof body.mode === "string" &&
            Object.prototype.hasOwnProperty.call(
              MODE_PROMPTS,
              body.mode,
            )
              ? body.mode
              : "chat";

          const system = `
You are Dalla AI.

Tagline:
Think Faster. Create Smarter.

You are a precise, friendly and reliable AI workspace assistant.

${MODE_PROMPTS[mode]}

Important rules:

- Never expose API keys.
- Never expose private server configuration.
- Never claim to have accessed a file, website, database or tool unless you actually did.
- Do not fabricate citations.
- Do not fabricate sources.
- Do not pretend to have performed actions that you did not perform.
- Prefer concise answers unless the user requests detail.
`;

          const result = streamText({
            model: openai("gpt-5.6"),

            system,

            messages:
              await convertToModelMessages(
                body.messages as UIMessage[],
              ),

            abortSignal: request.signal,
          });

          return result.toUIMessageStreamResponse({
            originalMessages:
              body.messages as UIMessage[],
          });
        } catch (error) {
          console.error(
            "Dalla AI chat error:",
            error,
          );

          return jsonError(
            error instanceof Error
              ? error.message
              : "Unable to process the AI request.",
            500,
          );
        }
      },
    },
  },
});
