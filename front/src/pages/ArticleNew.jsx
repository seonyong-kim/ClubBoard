import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http from "../api/http";
import "./Login.css"; // 기본 폼 스타일 재사용 (원하면 별도 CSS로 교체)

export default function ArticleNew() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 로그인 확인
  useEffect(() => {
    (async () => {
      try {
        await http.get("/auth/me");
        setAuthed(true);
      } catch {
        setAuthed(false);
        nav("/login", { replace: true });
      }
    })();
  }, [nav]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // 간단 검증
    if (!form.title.trim()) return setErr("제목을 입력하세요.");
    if (!form.content.trim()) return setErr("내용을 입력하세요.");

    setLoading(true);
    try {
      // 백엔드 스펙에 맞춰 body 필드명 조정 가능: { title, content }
      const res = await http.post("/articles", {
        title: form.title.trim(),
        content: form.content.trim(),
      });

      // 생성된 글 id가 내려오면 상세로 이동, 없으면 목록으로
      const id = res?.data?.id ?? res?.data?.article?.id;
      if (id) nav(`/articles/${id}`);
      else nav("/");
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
        "글을 등록하지 못했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!authed) return null; // 로그인 리다이렉트 중

  return (
    <main className="login" style={{ maxWidth: 720 }}>
      <h1>글쓰기</h1>

      <form className="login__form" onSubmit={onSubmit}>
        <label>
          제목
          <input
            type="text"
            name="title"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={onChange}
            required
          />
        </label>

        <label>
          내용
          <textarea
            name="content"
            placeholder="내용을 입력하세요"
            value={form.content}
            onChange={onChange}
            rows={12}
            style={{ resize: "vertical" }}
            required
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? "등록 중..." : "등록"}
          </button>
          <Link
            to="/"
            className="btn"
            style={{
              padding: "8px 14px",
              border: "1px solid #ddd",
              borderRadius: 8,
              textDecoration: "none",
              background: "#f7f7f7",
              color: "#111",
            }}
          >
            취소
          </Link>
        </div>

        {err && (
          <p className="error" style={{ color: "#c00", marginTop: 12 }}>
            {err}
          </p>
        )}
      </form>
    </main>
  );
}
