import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";

export default function BoardList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [raw, setRaw] = useState(null);

  // ✅ 페이지네이션 상태
  const [page, setPage] = useState(0); // 0-base
  const size = 8; // ← 페이지당 8개
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ 로그인 여부 (작성하기 버튼 표시용)
  const [authed, setAuthed] = useState(false);
  const authFetching = useRef(false);

  const refreshAuth = async () => {
    if (authFetching.current) return;
    authFetching.current = true;
    try {
      await http.get("/auth/me");
      setAuthed(true);
    } catch {
      setAuthed(false);
    } finally {
      authFetching.current = false;
    }
  };

  useEffect(() => {
    refreshAuth();
    const onChanged = () => refreshAuth();
    const onExpired = () => setAuthed(false);
    window.addEventListener("auth-changed", onChanged);
    window.addEventListener("auth-expired", onExpired);
    return () => {
      window.removeEventListener("auth-changed", onChanged);
      window.removeEventListener("auth-expired", onExpired);
    };
  }, []);

  // ✅ 목록 로드 (page가 바뀔 때마다 재호출)
  useEffect(() => {
    let on = true;
    setLoading(true);
    (async () => {
      try {
        const res = await http.get("/articles", { params: { page, size } });
        setRaw(res.data);
        // Spring Page 응답 가드
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        if (!on) return;
        setArticles(list);

        // 페이지 정보
        const tp = res.data?.totalPages ?? 1;
        const te = res.data?.totalElements ?? list.length;
        setTotalPages(tp);
        setTotalElements(te);
      } catch (e) {
        setErr(
          e?.response?.data?.message ||
            e.message ||
            "게시글을 불러오지 못했습니다."
        );
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [page]); // ← page 변경 시 재로딩

  // 페이지 이동 핸들러
  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

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

  return (
    <main className="page" style={{ width: "100%", margin: 0, padding: 0 }}>
      <div
        style={{
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 className="page__title" style={{ marginRight: "auto" }}>
          게시판{" "}
          <small style={{ fontSize: 12, color: "#666" }}>
            ({totalElements}건)
          </small>
        </h1>

        {/* ✅ 로그인 시에만 작성하기 버튼 표시 */}
        {authed && (
          <Link
            to="/articles/new"
            className="btn"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              textDecoration: "none",
              background: "#111",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            작성하기
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <div style={{ padding: 20 }}>
          게시글이 없습니다.
          <pre
            style={{
              marginTop: 12,
              background: "#f7f7f7",
              padding: 12,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(raw, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          <div className="table" style={{ width: "100%" }}>
            <div
              className="table__head"
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 160px 200px",
                background: "#fafafa",
                borderBottom: "1px solid #eee",
                fontWeight: 600,
              }}
            >
              <div className="c-id" style={{ padding: "12px 14px" }}>
                번호
              </div>
              <div className="c-title" style={{ padding: "12px 14px" }}>
                제목
              </div>
              <div className="c-author" style={{ padding: "12px 14px" }}>
                작성자
              </div>
              <div className="c-date" style={{ padding: "12px 14px" }}>
                작성일
              </div>
            </div>

            {articles.map((a) => (
              <div
                className="row"
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 160px 200px",
                  borderBottom: "1px solid #f2f2f2",
                }}
              >
                <div className="c-id" style={{ padding: "12px 14px" }}>
                  {a.id}
                </div>
                <div className="c-title" style={{ padding: "12px 14px" }}>
                  <Link
                    to={`/articles/${a.id}`}
                    className="link"
                    style={{ color: "#111", textDecoration: "none" }}
                  >
                    {a.title}
                  </Link>
                </div>
                <div className="c-author" style={{ padding: "12px 14px" }}>
                  {a.author}
                </div>
                <div className="c-date" style={{ padding: "12px 14px" }}>
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleString("ko-KR", {
                        timeZone: "Asia/Seoul",
                      })
                    : "-"}
                </div>
              </div>
            ))}
          </div>

          {/* ✅ 페이지네이션 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <button
              onClick={goPrev}
              disabled={!canPrev}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: canPrev ? "#fff" : "#f3f3f3",
                cursor: canPrev ? "pointer" : "default",
              }}
            >
              이전
            </button>

            <span style={{ fontSize: 14, color: "#666", padding: "0 6px" }}>
              {page + 1} / {Math.max(totalPages, 1)}
            </span>

            <button
              onClick={goNext}
              disabled={!canNext}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: canNext ? "#fff" : "#f3f3f3",
                cursor: canNext ? "pointer" : "default",
              }}
            >
              다음
            </button>
          </div>
        </>
      )}
    </main>
  );
}
