import { createRoot } from "react-dom/client";
import App from "./App"; // 👈 GARANTE QUE ESTA LINHA EXISTE!
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
