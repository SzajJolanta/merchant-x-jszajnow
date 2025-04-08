// ProductsLayout.tsx (formerly ProductEditorLayout.tsx)
import React, { useEffect, useState } from "react";
import { useProductStore } from "@/stores/useProductStore";
import ProductCard from "@/components/product/ProductCard";
import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";
import { useLocation } from "wouter";
import { PlusIcon, SearchIcon } from "@/components/icons/icons";

const ProductsLayout: React.FC = () => {
    const {
        products,
        isLoading,
        error,
        fetchProducts,
        deleteProduct,
    } = useProductStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "price">("newest");
    const [, navigate] = useLocation();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCreate = () => navigate("products/create");
    const handleCreateSample = () => navigate("products/create?sample=true");
    const handleEdit = (product: ProductListing) => {
        const id = ProductListingUtils.getProductId(product);
        if (id) navigate(`products/edit/${id}`);
    };

    const filtered = Array.from(products.values()).filter((p) => {
        const title = p.tags.find((t) => t[0] === "title")?.[1] ?? "";
        const summary = p.tags.find((t) => t[0] === "summary")?.[1] ?? "";
        return `${title} ${summary} ${p.content}`.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "newest") return (b.created_at || 0) - (a.created_at || 0);
        const aPrice = parseFloat(a.tags.find((t) => t[0] === "price")?.[1] ?? "0");
        const bPrice = parseFloat(b.tags.find((t) => t[0] === "price")?.[1] ?? "0");
        return aPrice - bPrice;
    });

    const productEvents = sorted.map((p) => ({
        id: ProductListingUtils.getProductId(p) ?? "",
        content: p.content,
        tags: p.tags,
        created_at: p.created_at,
        pubkey: "",
        kind: 30402,
    }));
    console.log("Rendering ProductsLayout"); // or CreateLayout, EditorLayout


    return (
        <div className="mx-auto px-4 py-8">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <div className="flex gap-2">
                    <button onClick={handleCreate} className="btn-primary">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Product
                    </button>
                    <button onClick={handleCreateSample} className="btn-secondary">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Sample Product
                    </button>
                </div>
            </div>

            {/* Search / Sort */}
            <div className="flex gap-4 mb-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5">
                        <SearchIcon className="text-gray-400" />
                    </div>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "newest" | "price")}
                    className="input"
                >
                    <option value="newest">Newest</option>
                    <option value="price">Price</option>
                </select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : productEvents.length === 0 ? (
                <div className="text-center text-gray-500">No products found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productEvents.map((event) => (
                        <ProductCard
                            key={event.id}
                            event={event}
                            onEdit={handleEdit}
                            onDelete={deleteProduct}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsLayout;
