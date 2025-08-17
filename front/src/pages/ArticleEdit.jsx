import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import http from "../api/http";
import "./Login.css"; // 폼 스타일 재사용

export default function ArticleEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });

  // 초기 로드: 로그인 사용자 + 글 데이터 가져오기
  useEffect(() => {
    let on = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        // 1) 로그인 확인
        const meRes = await http.get("/auth/me");
        if (!on) return;
        setMe(meRes.data);

        // 2) 글 데이터
        const artRes = await http.get(`/articles/${id}`);
        if (!on) return;

        // 3) 소유자 체크
        if (meRes.data?.username !== artRes.data?.author) {
          alert("본인 글만 수정할 수 있습니다.");
          nav(`/articles/${id}`, { replace: true });
          return;
        }

        // 4) 폼 채우기
        setForm({
          title: artRes.data.title ?? "",
          content: artRes.data.content ?? "",
        });
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "수정 페이지를 불러오지 못했습니다.";
        setErr(msg);

        // 미인증이면 로그인으로
        if (e?.response?.status === 401) {
          nav("/login", { replace: true });
        }
      } finally {
        if (on) setLoading(false);
      }
    })();

    return () => {
      on = false;
    };
  }, [id, nav]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("제목을 입력하세요.");
    if (!form.content.trim()) return setErr("내용을 입력하세요.");

    setSaving(true);
    try {
      await http.put(`/articles/${id}`, {
        title: form.title.trim(),
        content: form.content.trim(),
      });

      alert("수정되었습니다.");
      nav(`/articles/${id}`, { replace: true });
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
        "수정에 실패했습니다.";
      setErr(msg);

      if (e2?.response?.status === 401) nav("/login", { replace: true });
      if (e2?.response?.status === 403) {
        alert("본인 글만 수정할 수 있습니다.");
        nav(`/articles/${id}`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <main className="login">
        <p>불러오는 중…</p>
      </main>
    );

  if (err)
    return (
      <main className="login">
        <p className="error" style={{ color: "#c00" }}>
          {err}
        </p>
      </main>
    );

  return (
    <main className="login" style={{ maxWidth: 720 }}>
      <h1>글 수정</h1>
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
          <button type="submit" disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
          <Link
            to={`/articles/${id}`}
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
