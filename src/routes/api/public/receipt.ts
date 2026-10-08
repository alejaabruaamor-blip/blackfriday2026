import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
const s = (v: FormDataEntryValue | null, n = 120) => (typeof v === "string" ? v.slice(0, n) : null);

export const Route = createFileRoute("/api/public/receipt")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("bad", { status: 400, headers: CORS });
        }
        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024) {
          return new Response("arquivo invalido", { status: 400, headers: CORS });
        }
        const mime = file.type || "application/octet-stream";
        if (!OK_TYPES.includes(mime)) return new Response("tipo invalido", { status: 400, headers: CORS });
        const ext = mime === "application/pdf" ? "pdf" : mime.split("/")[1];
        const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const up = await supabaseAdmin.storage
          .from("comprovantes")
          .upload(path, await file.arrayBuffer(), { contentType: mime });
        if (up.error) return new Response("erro", { status: 500, headers: CORS });
        await supabaseAdmin.from("receipts").insert({
          file_path: path,
          file_name: file.name.slice(0, 120),
          mime,
          txid: s(form.get("txid"), 80),
          amount: s(form.get("amount"), 20),
          customer_name: s(form.get("nome")),
          customer_cpf: s(form.get("cpf"), 20),
          customer_phone: s(form.get("telefone"), 30),
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...CORS, "content-type": "application/json" },
        });
      },
    },
  },
});
