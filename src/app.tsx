import "./app.css";
import config from "@root/config";
import ProductsPage from "./pages/ProductPage";
import LoginLayout from "./layouts/LoginLayout";
import Header from "./components/Header";

export function App() {
  return (
    <LoginLayout>
      <Header />
      <ProductsPage />
      <div className="border-2 border-white m-4 p-4">
        <h2>Relay Pool</h2>
        {config.relays.map((relay: string) => <p key={relay}>{relay}</p>)}
      </div>
    </LoginLayout>
  );
}
