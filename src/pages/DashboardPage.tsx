import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllPagesForCms, deletePage, createPage } from "../lib/api";
import { PlusCircle, Edit, Trash2, LogOut } from "lucide-react";
import type { Page } from "../types";

export default function DashboardPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPagesForCms();
      setPages(data);
    } catch (error) {
      console.error("Falha ao buscar páginas", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    navigate("/login");
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
        navigate(`/dashboard/edit/${newPage._id}`);
      } catch (error) {
        alert("Erro ao criar a página. Verifique se o slug já existe.");
        console.error(
          "Erro ao criar a página. Verifique se o slug já existe.",
          error
        );
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      window.confirm(`Tem a certeza que deseja excluir a página "${title}"?`)
    ) {
      try {
        await deletePage(id);
        fetchPages();
      } catch (error) {
        alert("Erro ao excluir a página.");
        console.error("Erro ao excluir a página:", error);
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
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          <LogOut size={18} />
          Sair
        </button>
      </header>
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Páginas</h2>
          <button
            onClick={handleCreatePage}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusCircle size={20} />
            Criar Página
          </button>
        </div>
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-md border"
            >
              <div>
                <p className="font-semibold text-gray-800">{page.title}</p>
                <p className="text-sm text-gray-500">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to={`/dashboard/edit/${page._id}`}
                  title="Editar"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={20} />
                </Link>
                <button
                  onClick={() => handleDelete(page._id, page.title)}
                  title="Excluir"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
