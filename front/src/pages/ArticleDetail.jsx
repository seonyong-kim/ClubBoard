import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import http from "../api/http";
import "./ArticleDetail.css";

export default function ArticleDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [article, setArticle] = useState(null);
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ 로그인 사용자
  const [me, setMe] = useState(null);
  const isOwner = me && article && me.username === article.author;

  useEffect(() => {
    let on = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 상세 조회
        const res = await http.get(`/articles/${id}`);
        if (!on) return;
        setArticle(res.data);

        // 현재 로그인 사용자
        try {
          const meRes = await http.get("/auth/me");
          if (on) setMe(meRes.data);
        } catch {
          if (on) setMe(null);
        }

        // 이전/다음 (실패 무시)
        try {
          const prev = await http.get(`/articles/${id}/prev`);
          if (on && prev?.data?.id) setPrevId(prev.data.id);
        } catch {}
        try {
          const next = await http.get(`/articles/${id}/next`);
          if (on && next?.data?.id) setNextId(next.data.id);
        } catch {}
      } catch (e) {
        setErr(e?.response?.data?.message || "게시글을 불러오지 못했습니다.");
      } finally {
        if (on) setLoading(false);
      }
    })();

    return () => {
      on = false;
    };
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await http.delete(`/articles/${id}`);
      alert("삭제되었습니다.");
      nav("/");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "삭제에 실패했습니다.";
      alert(msg);
    }
  };

  const goEdit = () => {
    nav(`/articles/${id}/edit`);
  };

  if (loading)
    return (
      <main className="page">
        <p>불러오는 중…</p>
      </main>
    );
  if (err)
    return (
      <main className="page">
        <p className="error">{err}</p>
      </main>
    );
  if (!article)
    return (
      <main className="page">
        <p>데이터가 없습니다.</p>
      </main>
    );

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
      : "-";

  return (
    <main className="page detail">
      {/* 상단: 제목 / 메타 */}
      <div
        className="detail__header"
        style={{ display: "flex", gap: 12, alignItems: "center" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="detail__title">{article.title}</h1>
          <div className="detail__meta">
            <span>작성자 {article.author}</span>
            <span>·</span>
            <span>{fmtDate(article.createdAt)}</span>
          </div>
        </div>

        {/* ✅ 본인 글일 때만 수정/삭제 */}
        {isOwner && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={goEdit}
              className="btn"
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="btn"
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e55",
                background: "#e55",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 본문 */}
      <article className="detail__content">
        {article.content ? (
          <pre className="detail__pre">{article.content}</pre>
        ) : (
          <div className="detail__empty">본문이 없습니다.</div>
        )}
      </article>

      {/* 이전/다음 네비게이션 */}
      <nav className="detail__nav">
        <button
          className="nav__btn"
          disabled={!prevId}
          onClick={() => prevId && nav(`/articles/${prevId}`)}
        >
          ← 이전 글
        </button>
        <Link to="/" className="nav__home">
          목록
        </Link>
        <button
          className="nav__btn"
          disabled={!nextId}
          onClick={() => nextId && nav(`/articles/${nextId}`)}
        >
          다음 글 →
        </button>
      </nav>
    </main>
  );
}
