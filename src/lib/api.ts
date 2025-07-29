import axios from "axios";
import type { Page } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (
  email: string,
  password: string
): Promise<{ access_token: string }> => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const getAllPagesForCms = async (): Promise<Page[]> => {
  const { data } = await api.get("/cms/pages");
  return data;
};

export const getPageById = async (id: string): Promise<Page> => {
  const { data } = await api.get(`/cms/pages/${id}`);
  return data;
};

export const updatePage = async (
  id: string,
  pageData: Partial<Page>
): Promise<Page> => {
  const { data } = await api.put(`/cms/pages/${id}`, pageData);
  return data;
};

export const createPage = async (pageData: {
  title: string;
  slug: string;
}): Promise<Page> => {
  const { data } = await api.post("/cms/pages", pageData);
  return data;
};

export const deletePage = async (
  id: string
): Promise<{ deleted: boolean; id: string }> => {
  const { data } = await api.delete(`/cms/pages/${id}`);
  return data;
};
