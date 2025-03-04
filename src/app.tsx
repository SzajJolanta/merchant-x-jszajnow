import "./app.css";
import config from "@root/config";
import ProductsPage from "./pages/ProductPage";

export function App() {
  return (
    <>
      <ProductsPage />
      <div className="border-2 border-white m-4 p-4">
        <h2>Relay Pool</h2>
        {config.relays.map((relay: string) => <p key={relay}>{relay}</p>)}
      </div>
      <div className="mt-8">
      </div>
    </>
  );
}
