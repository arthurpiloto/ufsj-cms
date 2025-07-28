"use client";
import React, { useState, useEffect, useCallback } from "react";
import { getPageById, updatePage } from "@/lib/api";
import { produce } from "immer";
import { Plus, Trash, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Page, Section, PageDocument, Annex } from "@/types";

export default function PageEditor({ params }: { params: { pageId: string } }) {
  const { pageId } = params;
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPageById(pageId);
      setPage(data);
    } catch (error: unknown) {
      console.error("Falha ao buscar os dados da página", error);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    try {
      const {
        _id: _pageId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...pageDataToSave
      } = page;
      await updatePage(pageId, pageDataToSave);
      alert("Página salva com sucesso!");
    } catch (error: unknown) {
      console.error("Falha ao salvar a página", error);
      alert("Erro ao salvar a página.");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (path: (string | number)[], value: string) => {
    setPage(
      produce((draft: Page | null) => {
        if (!draft) return;
        let current: unknown = draft;
        for (let i = 0; i < path.length - 1; i++) {
          current = (current as { [key: string]: unknown })[path[i]];
        }
        (current as { [key: string]: unknown })[path[path.length - 1]] = value;
      })
    );
  };

  const handleAddNew = (
    type: "section" | "document" | "annex",
    parentPath: (string | number)[]
  ) => {
    let newItem: Section | PageDocument | Annex;

    if (type === "section") {
      newItem = { title: "Nova Seção", type: "document-list", documents: [] };
    } else if (type === "document") {
      newItem = {
        title: "Novo Documento",
        url: "",
        description: "",
        annexes: [],
      };
    } else {
      newItem = { title: "Novo Anexo", url: "", description: "" };
    }

    setPage(
      produce((draft: Page | null) => {
        if (!draft) return;
        let parentList: unknown = draft;
        for (const key of parentPath) {
          parentList = (parentList as { [key: string]: unknown })[key];
        }

        if (Array.isArray(parentList)) {
          parentList.push(newItem);
        }
      })
    );
  };

  const handleRemove = (path: (string | number)[]) => {
    if (!window.confirm("Tem a certeza que deseja remover este item?")) return;
    setPage(
      produce((draft: Page | null) => {
        if (!draft) return;
        let parent: unknown = draft;
        for (let i = 0; i < path.length - 2; i++) {
          parent = (parent as { [key: string]: unknown })[path[i]];
        }
        const list = (parent as { [key: string]: unknown })[
          path[path.length - 2]
        ];

        if (Array.isArray(list)) {
          list.splice(path[path.length - 1] as number, 1);
        }
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Voltar para o Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-1">A editar: {page.title}</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 w-full sm:w-auto justify-center"
          >
            <Save size={18} />
            {saving ? "A salvar..." : "Salvar Página"}
          </button>
        </div>
      </header>

      <main className="container mx-auto bg-white p-6 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da Página
            </label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => handleFieldChange(["title"], e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug da Página (URL)
            </label>
            <input
              type="text"
              value={page.slug}
              onChange={(e) => handleFieldChange(["slug"], e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <hr className="my-8" />

        <div>
          <h2 className="text-2xl font-semibold mb-4">Seções</h2>
          <div className="space-y-6">
            {page.sections?.map((section, sectionIndex) => (
              <div
                key={section._id || sectionIndex}
                className="bg-gray-50 p-4 rounded-lg border"
              >
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleFieldChange(
                        ["sections", sectionIndex, "title"],
                        e.target.value
                      )
                    }
                    className="text-xl font-bold p-1 border-b-2 border-transparent focus:border-blue-500 outline-none bg-transparent w-full"
                  />
                  <button
                    onClick={() => handleRemove(["sections", sectionIndex])}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 ml-4"
                  >
                    <Trash size={18} />
                  </button>
                </div>

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
                          className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
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
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
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
                    className="text-sm flex items-center gap-1 text-blue-600 hover:underline mt-4"
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
        </div>
      </main>
    </div>
  );
}
