import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllPagesForCms, deletePage, createPage } from "../lib/api";
import { PlusCircle, Edit, Trash2, LogOut } from "lucide-react";
import type { Page } from "../types";
import CmsHeader from "../components/CmsHeader";

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
    <div className="flex flex-col min-h-screen">
      <CmsHeader
        title="Pró-Reitoria de Ensino de Graduação"
        subtitle="Universidade Federal de São João del-Rei"
      />
      <main className="main-content flex-fill flex-col flex align-items-center p-4">
        <div className="w-full flex justify-content-evenly align-items-center">
          <button
            onClick={handleLogout}
            className="gap flex items-center px-4 py-2"
          >
            <LogOut size={18} />
            Sair
          </button>
          <button
            onClick={handleCreatePage}
            className="gap flex items-center px-4 py-2"
          >
            <PlusCircle size={20} />
            Criar Página
          </button>
        </div>
        <div className="w-full flex flex-col gap">
          {pages.map((page) => (
            <div
              key={page._id}
              className="w-full flex align-items-center justify-content-between p-4 rounder-sm border"
            >
              <div>
                <p>{page.title}</p>
                <p>URL: /{page.slug}</p>
              </div>
              <div className="flex align-items-center justify-content-center">
                <Link
                  to={`/dashboard/edit/${page._id}`}
                  className="flex text-pure-100"
                  title="Editar"
                >
                  <Edit size={20} />
                </Link>
                <button
                  onClick={() => handleDelete(page._id, page.title)}
                  title="Excluir"
                  className="flex border-none bg-pure-0"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
