import { useEffect, useState } from "react";
import { PageContent } from "../components/PageContent";
import { initialDocument, type PageDocument } from "../lib/document";
import { client, errorMessage } from "../lib/supabase";
export default function PublicPage() {
  const [document, setDocument] = useState<PageDocument>(initialDocument);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await client()
          .from("ls_published")
          .select("document")
          .eq("id", true)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) {
          setDocument(data?.document || initialDocument);
          setState("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setState("error");
          console.warn("Leitura pública indisponível:", errorMessage(error));
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [retry]);
  if (state === "loading")
    return (
      <main className="loading" role="status">
        Preparando nossos encontros…
      </main>
    );
  return (
    <>
      {state === "error" && (
        <div className="public-error" role="alert">
          Não foi possível carregar os links agora.{" "}
          <button
            onClick={() => {
              setState("loading");
              setRetry((n) => n + 1);
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
      <PageContent document={document} />
    </>
  );
}
