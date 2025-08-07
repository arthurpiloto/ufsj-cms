import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPageById, updatePage } from "../lib/api";
import { produce } from "immer";
import { Plus, Trash, Save, ArrowLeft } from "lucide-react";
import type { Page, Section, PageDocument, Annex } from "../types";
import CmsHeader from "../components/CmsHeader";

export default function PageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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
      navigate("/dashboard");
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
    <div>
      <CmsHeader
        title="Pró-Reitoria de Ensino de Graduação"
        subtitle="Universidade Federal de São João del-Rei"
      />
      <main className="main-content d-flex full-grow flex-column align-items-center p-4">
        <div className="gap d-flex full-grow justify-content-center align-items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="d-flex align-items-center justify-content-center gap px-6 py-2"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="d-flex align-items-center justify-content-center gap px-6 py-2"
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <div className="d-flex gap full-grow flex-column align-items-center justify-content-ceter">
          <input
            className="text-up-05 full-grow m-0 p-1"
            type="text"
            value={page.title}
            onChange={(e) => handleFieldChange(["title"], e.target.value)}
          />

          {page.sections?.map((section, sectionIndex) => (
            <div
              key={section._id || sectionIndex}
              className="d-flex gap flex-column full-grow"
            >
              <div className="d-flex flex-column align-items-start">
                <span>Título da Seção:</span>
                <div className="gap d-flex align-items-start mid-grow">
                  <input
                    type="text"
                    value={section.title}
                    className="p-1 m-0 full-grow"
                    onChange={(e) =>
                      handleFieldChange(
                        ["sections", sectionIndex, "title"],
                        e.target.value
                      )
                    }
                  />
                  <button
                    className="px-2 py-1 d-flex align-items-center justify-content-center"
                    onClick={() => handleRemove(["sections", sectionIndex])}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>

              {section.documents?.map((doc, docIndex) => (
                <div
                  key={doc._id || docIndex}
                  className="gap d-flex flex-column"
                >
                  <div className="d-flex flex-column align-items-start">
                    <span>Título do Edital:</span>
                    <div className="d-flex gap align-items-start full-grow">
                      <input
                        type="text"
                        value={doc.title}
                        className="m-0 p-1 mid-grow"
                        onChange={(e) =>
                          handleFieldChange(
                            [
                              "sections",
                              sectionIndex,
                              "documents",
                              docIndex,
                              "title",
                            ],
                            e.target.value
                          )
                        }
                      />
                      <button
                        className="px-2 py-1 d-flex align-items-center justify-content-center"
                        onClick={() =>
                          handleRemove([
                            "sections",
                            sectionIndex,
                            "documents",
                            docIndex,
                          ])
                        }
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex align-items-start flex-column">
                    <span className="">URL do Documento:</span>
                    <div className="d-flex gap align-items-start full-grow">
                      <input
                        type="text"
                        className="m-0 p-1 full-grow"
                        value={doc.url || ""}
                        placeholder="URL do Documento"
                        onChange={(e) =>
                          handleFieldChange(
                            [
                              "sections",
                              sectionIndex,
                              "documents",
                              docIndex,
                              "url",
                            ],
                            e.target.value
                          )
                        }
                      />
                      <button
                        className="px-2 py-1 d-flex align-items-start"
                        onClick={() =>
                          handleFieldChange(
                            [
                              "sections",
                              sectionIndex,
                              "documents",
                              docIndex,
                              "url",
                            ],
                            ""
                          )
                        }
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="d-flex flex-column align-items-start">
                    <span>Descrição do Edital:</span>
                    <textarea
                      placeholder="Descrição do Edital"
                      value={doc.description || ""}
                      className="full-grow"
                      onChange={(e) =>
                        handleFieldChange(
                          [
                            "sections",
                            sectionIndex,
                            "documents",
                            docIndex,
                            "description",
                          ],
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
      {/* 
      <div>
        <div className="space-y-6">
          {page.sections?.map((section, sectionIndex) => (
            <div
              key={section._id || sectionIndex}
              className="bg-gray-50 p-4 rounded-lg border"
            >
              <div className="space-y-4 pl-4">
                {section.documents?.map((doc, docIndex) => (
                  <div
                    key={doc._id || docIndex}
                    className="bg-white p-3 rounded border shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) =>
                          handleFieldChange(
                            [
                              "sections",
                              sectionIndex,
                              "documents",
                              docIndex,
                              "title",
                            ],
                            e.target.value
                          )
                        }
                        className="font-semibold p-1 w-full"
                      />
                      <button
                        onClick={() =>
                          handleRemove([
                            "sections",
                            sectionIndex,
                            "documents",
                            docIndex,
                          ])
                        }
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="URL do documento"
                      value={doc.url || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          [
                            "sections",
                            sectionIndex,
                            "documents",
                            docIndex,
                            "url",
                          ],
                          e.target.value
                        )
                      }
                      className="text-sm p-1 w-full border rounded mb-2"
                    />
                    <textarea
                      placeholder="Descrição"
                      value={doc.description || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          [
                            "sections",
                            sectionIndex,
                            "documents",
                            docIndex,
                            "description",
                          ],
                          e.target.value
                        )
                      }
                      className="text-sm p-1 w-full border rounded h-16"
                    />

                    <div className="mt-3 pl-4">
                      <h4 className="text-sm font-semibold mb-2">Anexos</h4>
                      {doc.annexes?.map((annex, annexIndex) => (
                        <div
                          key={annex._id || annexIndex}
                          className="flex items-center gap-2 mb-2"
                        >
                          <input
                            type="text"
                            placeholder="Título do anexo"
                            value={annex.title}
                            onChange={(e) =>
                              handleFieldChange(
                                [
                                  "sections",
                                  sectionIndex,
                                  "documents",
                                  docIndex,
                                  "annexes",
                                  annexIndex,
                                  "title",
                                ],
                                e.target.value
                              )
                            }
                            className="text-sm p-1 flex-grow border rounded"
                          />
                          <input
                            type="text"
                            placeholder="URL do anexo"
                            value={annex.url}
                            onChange={(e) =>
                              handleFieldChange(
                                [
                                  "sections",
                                  sectionIndex,
                                  "documents",
                                  docIndex,
                                  "annexes",
                                  annexIndex,
                                  "url",
                                ],
                                e.target.value
                              )
                            }
                            className="text-sm p-1 flex-grow border rounded"
                          />
                          <button
                            onClick={() =>
                              handleRemove([
                                "sections",
                                sectionIndex,
                                "documents",
                                docIndex,
                                "annexes",
                                annexIndex,
                              ])
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          handleAddNew("annex", [
                            "sections",
                            sectionIndex,
                            "documents",
                            docIndex,
                            "annexes",
                          ])
                        }
                        className="text-xs flex items-center gap-1 text-blue-600 hover:underline mt-2"
                      >
                        <Plus size={14} /> Adicionar Anexo
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    handleAddNew("document", [
                      "sections",
                      sectionIndex,
                      "documents",
                    ])
                  }
                  className="text-sm flex items-center gap-1 text-green-600 hover:underline mt-4"
                >
                  <Plus size={16} /> Adicionar Documento
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => handleAddNew("section", ["sections"])}
          className="mt-6 flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          <Plus size={18} /> Adicionar Seção
        </button>
      </div> */}
    </div>
  );
}
