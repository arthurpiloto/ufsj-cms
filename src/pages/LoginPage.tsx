import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import axios from "axios";
import CmsHeader from "../components/CmsHeader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("jwt_token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Falha no login.");
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CmsHeader
        title="Pró-Reitoria de Ensino de Graduação"
        subtitle="Universidade Federal de São João del-Rei"
      />
      <main className="d-flex align-items-center justify-content-center p-4">
        <div className="px-10x py-8x rounder-md shadow-sm">
          <h1 className="mb-6">Acesso ao CMS</h1>
          <form onSubmit={handleSubmit}>
            <div className="d-flex flex-column mb-4">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2"
                required
              />
            </div>
            <div className="d-flex flex-column mb-4">
              <label className="mb-2" htmlFor="password">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2"
                required
              />
            </div>
            {error && <p className="mb-4">{error}</p>}
            <button type="submit" disabled={loading} className="py-2">
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
