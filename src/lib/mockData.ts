import type { Page } from "../types";

export const mockPages: Page[] = [
  {
    _id: "mock-id-1",
    title: "Editais e Legislações (Mock)",
    slug: "editais-e-legislacoes-mock",
    sections: [
      {
        _id: "mock-sec-1",
        title: "Editais UFSJ (Dados Locais)",
        type: "document-list",
        documents: [
          {
            _id: "mock-doc-1",
            title: "Edital Falso nº 1/2025 para Teste Visual",
            url: "#",
            description:
              "Este é um edital de exemplo para desenvolvimento visual. A URL não funciona em modo offline.",
            annexes: [
              {
                _id: "mock-anx-1",
                title: "Anexo I - Cronograma Falso",
                url: "#",
              },
              {
                _id: "mock-anx-2",
                title: "Anexo II - Documentação Falsa",
                url: "#",
              },
            ],
          },
          {
            _id: "mock-doc-2",
            title: "Outro Documento de Exemplo",
            url: "#",
            description: "Descrição para o segundo documento.",
            annexes: [],
          },
        ],
      },
      {
        _id: "mock-sec-2",
        title: "Legislação (Dados Locais)",
        type: "document-list",
        documents: [],
      },
    ],
  },
  {
    _id: "mock-id-2",
    title: "Página de Contato (Mock)",
    slug: "contato-mock",
    sections: [],
  },
];

// Função auxiliar para encontrar uma página por ID nos dados simulados.
export const findPageById = (id: string | undefined): Page | undefined => {
  if (!id) return undefined;
  const page = mockPages.find((p) => p._id === id);
  // Se uma página específica não for encontrada, retorna a primeira como fallback.
  // Isto garante que a página do editor sempre tenha dados para renderizar.
  return page || mockPages[0];
};
