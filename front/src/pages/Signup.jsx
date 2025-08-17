import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import "./Login.css"; // 로그인 스타일 재사용

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    // 클라이언트 검증
    if (!form.username || !form.password) {
      return setErr("아이디와 비밀번호를 입력해 주세요.");
    }
    if (form.password.length < 8) {
      return setErr("비밀번호는 8자 이상이어야 합니다.");
    }
    if (form.password !== form.confirm) {
      return setErr("비밀번호 확인이 일치하지 않습니다.");
    }

    setLoading(true);
    try {
      // 1) 회원가입 (백엔드 스펙 맞춰주세요: /auth/register)
      await http.post("/auth/register", {
        username: form.username,
        password: form.password,
      });

      // 2) 자동 로그인
      const res = await http.post("/auth/login", {
        username: form.username,
        password: form.password,
      });

      // 3) JWT 토큰 있으면 저장
      const token = res?.data?.token;
      if (token) localStorage.setItem("auth_token", token);

      // 4) 세션 기반 확인
      try {
        await http.get("/auth/me");
      } catch {}

      // 5) 상태 갱신
      window.dispatchEvent(new Event("auth-changed"));

      // 6) 홈으로 이동
      setOk("회원가입 완료! 자동 로그인되었습니다.");
      nav("/");
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
        "회원가입에 실패했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <h1>회원가입</h1>
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
            placeholder="비밀번호 (8자 이상)"
            value={form.password}
            onChange={onChange}
            required
            minLength={8}
          />
        </label>

        <label>
          비밀번호 확인
          <input
            type="password"
            name="confirm"
            placeholder="비밀번호 확인"
            value={form.confirm}
            onChange={onChange}
            required
            minLength={8}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "가입 중..." : "회원가입"}
        </button>

        {err && (
          <p className="error" style={{ color: "#c00" }}>
            {err}
          </p>
        )}
        {ok && (
          <p className="ok" style={{ color: "#0a0" }}>
            {ok}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </main>
  );
}
