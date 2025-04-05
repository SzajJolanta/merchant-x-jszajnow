import "./app.css";
import ProductsLayout from "./layouts/ProductsLayout";
import LoginLayout from "./layouts/LoginLayout";
import Header from "./components/Header";
import ShippingOptionsLayout from "./layouts/ShippingOptionsLayout";
import RelayPoolsLayout from "./layouts/RelayPoolsLayout";
import Sidebar from "@/components/Sidebar";

export function App() {
  return (
    <LoginLayout>
      <Header />
      <Sidebar />
    </LoginLayout>
  );
}

const OldApp = () => {
  return (
    <>
      <div className="mx-auto px-4 py-4">
        <h1 className="text-2xl font-semibold text-orange-900">
          Merchant X
        </h1>
        <p className="text-sm text-orange-500">
          The Merchant Experience for Nostr Rockstars
        </p>
      </div>

      <RelayPoolsLayout />
      <ProductsLayout />
      <ShippingOptionsLayout />

      <footer className="mt-8">
        <div className="mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            Powered by Nostr - Kind 30402 Product Listing
          </p>
        </div>
      </footer>
    </>
  );
};
