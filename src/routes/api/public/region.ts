import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function validCountry(value: string | null): string | null {
  if (!value) return null;
  const country = value.toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) return null;
  if (country === "XX" || country === "T1") return null;
  return country;
}

export const Route = createFileRoute("/api/public/region")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const headers = request.headers;
        const country = validCountry(
          headers.get("x-vercel-ip-country") ??
            headers.get("cf-ipcountry") ??
            headers.get("x-country-code"),
        );
        return new Response(JSON.stringify({ country }), {
          headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
