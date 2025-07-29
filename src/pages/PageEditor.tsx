import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getPageById, updatePage } from "../lib/api";
import { produce } from "immer";
import { Save, ArrowLeft } from "lucide-react";
import type { Page, Section, PageDocument, Annex } from "../types";

export default function PageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPage = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const data = await getPageById(pageId);
      setPage(data);
    } catch (error) {
      console.error("Falha ao buscar os dados da página", error);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSave = async () => {
    if (!page || !pageId) return;
    setSaving(true);
    try {
      const { ...pageDataToSave } = page;
      await updatePage(pageId, pageDataToSave);
      alert("Página salva com sucesso!");
    } catch (error) {
      alert("Erro ao salvar a página.");
      console.error("Erro ao salvar a página:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (path: (string | number)[], value: string) => {
    setPage(
      produce((draft: Page | null) => {
        if (!draft) return;
        let current: any = draft;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
      })
    );
  };

  const handleAddNew = (
    type: "section" | "document" | "annex",
    parentPath: (string | number)[]
  ) => {
    let newItem: Section | PageDocument | Annex;
    if (type === "section")
      newItem = { title: "Nova Seção", type: "document-list", documents: [] };
    else if (type === "document")
      newItem = {
        title: "Novo Documento",
        url: "",
        description: "",
        annexes: [],
      };
    else newItem = { title: "Novo Anexo", url: "", description: "" };

    setPage(
      produce((draft: Page | null) => {
        if (!draft) return;
        let parentList: any = draft;
        for (const key of parentPath) {
          parentList = parentList[key];
        }
        if (Array.isArray(parentList)) parentList.push(newItem);
      })
    );
  };

  const handleRemove = (path: (string | number)[]) => {
    if (!window.confirm("Tem a certeza que deseja remover este item?")) return;
    setPage(
      produce((draft: Page | null) => {
        if (!draft) return;
        let parent: any = draft;
        for (let i = 0; i < path.length - 2; i++) {
          parent = parent[path[i]];
        }
        const list = parent[path[path.length - 2]];
        if (Array.isArray(list))
          list.splice(path[path.length - 1] as number, 1);
      })
    );
  };

  if (loading)
    return <div className="p-10 text-center">A carregar editor...</div>;
  if (!page)
    return (
      <div className="p-10 text-center text-red-500">
        Não foi possível carregar a página.
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <header className="container mx-auto mb-8">
        <div className="flex justify-between items-center">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            <Save size={18} />
            {saving ? "A salvar..." : "Salvar"}
          </button>
        </div>
        <h1 className="text-3xl font-bold mt-4">A editar: {page.title}</h1>
      </header>
      <main className="container mx-auto bg-white p-6 rounded-lg shadow-xl"></main>
    </div>
  );
}
