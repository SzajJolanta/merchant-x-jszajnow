import React, { useEffect, useState, useMemo } from "react";
import { useProductStore } from "@/stores/useProductStore";
import ProductCard from "@/components/product/ProductCard";
import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";
import { useLocation } from "wouter";
import { PlusIcon, SearchIcon } from "@/components/icons/icons";

const getTagValue = (tags: string[][], key: string): string =>
    tags.find((tag) => tag[0] === key)?.[1] ?? "";

const ProductsLayout: React.FC = () => {
    const {
        products,
        isLoading,
        error,
        fetchProducts,
        deleteProduct,
    } = useProductStore();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<
        "newest" | "price" | "price-desc" | "title-asc" | "title-desc"
    >("newest");
    const [, navigate] = useLocation();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCreate = () => navigate("products/create");
    const handleSampleCreate = () => navigate("products/create?sample=true");

    const handleEdit = (product: ProductListing) => {
        const id = ProductListingUtils.getProductId(product);
        if (id) navigate(`products/edit/${id}`);
    };

    const filteredProducts = useMemo(() => {
        return Array.from(products.values()).filter((p) => {
            const title = getTagValue(p.tags, "title");
            const summary = getTagValue(p.tags, "summary");
            return `${title} ${summary} ${p.content}`.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [products, searchTerm]);

    const sortedProducts = useMemo(() => {
        const getPrice = (product: ProductListing) =>
            parseFloat(getTagValue(product.tags, "price") || "0");

        const getTitle = (product: ProductListing) =>
            getTagValue(product.tags, "title").toLowerCase();

        return [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return (b.created_at || 0) - (a.created_at || 0);
                case "price":
                    return getPrice(a) - getPrice(b);
                case "price-desc":
                    return getPrice(b) - getPrice(a);
                case "title-asc":
                    return getTitle(a).localeCompare(getTitle(b));
                case "title-desc":
                    return getTitle(b).localeCompare(getTitle(a));
                default:
                    return 0;
            }
        });
    }, [filteredProducts, sortBy]);

    const productEvents = useMemo(() => {
        return sortedProducts.map((p) => ({
            id: ProductListingUtils.getProductId(p) ?? "",
            content: p.content,
            tags: p.tags,
            created_at: p.created_at,
            pubkey: "",
            kind: 30402,
        }));
    }, [sortedProducts]);

    return (
        <div className="mx-auto px-4 py-8">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(
                                e.target.value as
                                    | "newest"
                                    | "price"
                                    | "price-desc"
                                    | "title-asc"
                                    | "title-desc"
                            )
                        }
                        className="px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="title-asc">Title: A–Z</option>
                        <option value="title-desc">Title: Z–A</option>
                    </select>

                    {/* Add Product Button */}
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Product
                    </button>
                    {/* Add Product Button */}
                    <button
                        onClick={handleSampleCreate}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Sample Product
                    </button>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    <span className="ml-3 text-lg text-gray-700">Loading products...</span>
                </div>
            ) : error ? (
                <div className="text-center text-red-600">{error}</div>
            ) : productEvents.length === 0 ? (
                <div className="text-center text-gray-500">No products found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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