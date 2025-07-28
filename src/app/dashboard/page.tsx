"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllPagesForCms, deletePage, createPage } from "@/lib/api";
import { PlusCircle, Edit, Trash2, LogOut } from "lucide-react";
import type { Page } from "@/types";

export default function DashboardPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPagesForCms();
      setPages(data);
    } catch (error: unknown) {
      console.error("Falha ao buscar páginas", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response &&
        error.response.status === 401
      ) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    router.push("/login");
  };

  const handleCreatePage = async () => {
    const title = prompt("Digite o título da nova página:");
    if (!title) return;
    const slug = prompt(
      `Digite o slug para "${title}" (ex: minha-nova-pagina):`
    );
    if (title && slug) {
      try {
        const newPage = await createPage({ title, slug });
        router.push(`/dashboard/edit/${newPage._id}`);
      } catch (error: unknown) {
        alert("Erro ao criar a página. Verifique se o slug já existe.");
        console.error(error);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      window.confirm(
        `Tem a certeza que deseja excluir a página "${title}"? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await deletePage(id);
        fetchPages();
      } catch (error: unknown) {
        alert("Erro ao excluir a página.");
        console.error(error);
      }
    }
  };

  if (loading) return <p className="text-center p-10">A carregar páginas...</p>;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Dashboard do CMS
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Páginas do Site
          </h2>
          <button
            onClick={handleCreatePage}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
          >
            <PlusCircle size={20} />
            Criar Nova Página
          </button>
        </div>
        <div className="space-y-3">
          {pages.length > 0 ? (
            pages.map((page) => (
              <div
                key={page._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md border hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-800">{page.title}</p>
                  <p className="text-sm text-gray-500">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/dashboard/edit/${page._id}`}
                    title="Editar"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit size={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(page._id, page.title)}
                    title="Excluir"
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">
              Nenhuma página encontrada. Crie a sua primeira página!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
