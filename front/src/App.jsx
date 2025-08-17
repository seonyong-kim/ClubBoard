import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import BoardList from "./pages/BoardList.jsx";
import Login from "./pages/Login.jsx";
import ArticleDetail from "./pages/ArticleDetail.jsx";
import Signup from "./pages/Signup";
import ArticleNew from "./pages/ArticleNew.jsx";
import ArticleEdit from "./pages/ArticleEdit.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<BoardList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/articles/new" element={<ArticleNew />} />
        <Route path="/articles/:id/edit" element={<ArticleEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
