import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ← Link 추가
import http from "../api/http";
import "./Login.css";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // 1) 로그인
      const res = await http.post("/auth/login", {
        username: form.username,
        password: form.password,
      });

      // 2) (옵션) JWT 저장 — 세션 기반이어도 무해
      const token = res?.data?.token;
      if (token) localStorage.setItem("auth_token", token);

      // 3) 세션 기반 확인: /auth/me로 즉시 점검 (실패해도 무시)
      try {
        await http.get("/auth/me");
      } catch {}

      // 4) 전역 상태 갱신
      window.dispatchEvent(new Event("auth-changed"));

      // 5) 홈으로 이동
      nav("/");
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
        "로그인에 실패했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <h1>로그인</h1>
      <form className="login__form" onSubmit={onSubmit}>
        <label>
          아이디
          <input
            type="text"
            name="username"
            placeholder="아이디"
            value={form.username}
            onChange={onChange}
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={onChange}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
        {err && (
          <p className="error" style={{ color: "#c00" }}>
            {err}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </main>
  );
}
