import React, { useEffect, useState } from "react";
import { useProductStore } from "@/stores/useProductStore";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";
import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";

const ProductLayout: React.FC = () => {
    const {
        products,
        isLoading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    } = useProductStore();
    const [showForm, setShowForm] = useState(false);
    const [editEvent, setEditEvent] = useState<ProductListing | undefined>(
        undefined,
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "price">("newest");

    useEffect(() => {
        // Fetch products on component mount
        fetchProducts();
    }, [fetchProducts]);

    const handleCreateClick = () => {
        setEditEvent(undefined);
        setShowForm(true);
    };

    const handleCreateSampleProductClick = () => {
        setEditEvent({
            tags: [
                ["title", "Sample Product"],
                ["summary", "This is a sample product"],
                ["price", "9.99", "USD"],
                ["stock", "10"],
            ],
            content: "This is a sample product description.",
            created_at: Math.floor(Date.now() / 1000),
            kind: 30402,
        });
        setShowForm(true);
    };

    const handleEditClick = (event: ProductListing) => {
        setEditEvent(event);
        setShowForm(true);
    };

    const handleDeleteClick = (id: string) => {
        deleteProduct(id);
    };

    const handleFormSubmit = async (
        tags: ProductListing["tags"],
        content: string,
    ) => {
        if (editEvent) {
            // Get the product ID
            const id = ProductListingUtils.getProductId(editEvent);
            if (!id) {
                handleProductCreate(tags, content);
                return;
            }
            handleProductUpdate(id, tags, content);
        }

        // Close the form
        setShowForm(false);
        setEditEvent(undefined);
    };

    const handleProductUpdate = async (
        id: string,
        tags: ProductListing["tags"],
        content: string,
    ) => {
        await updateProduct(id, {
            tags,
            content,
            created_at: Math.floor(Date.now() / 1000),
        });
    };

    const handleProductCreate = async (
        tags: ProductListing["tags"],
        content: string,
    ) => {
        await createProduct({
            kind: 30402,
            tags,
            content,
        });
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditEvent(undefined);
    };

    // Convert products Map to Array for rendering
    const productsArray: ProductListing[] = Array.from(products.values());

    // Filter products by search term
    const filteredProducts = productsArray.filter(
        (product: ProductListing) => {
            const title = product.tags.find((tag) => tag[0] === "title")?.[1] ||
                "";
            const summary =
                product.tags.find((tag) => tag[0] === "summary")?.[1] ||
                "";
            const searchString = `${title} ${summary} ${product.content}`
                .toLowerCase();
            return searchString.includes(searchTerm.toLowerCase());
        },
    );

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "newest") {
            return (b.created_at || 0) - (a.created_at || 0);
        } else if (sortBy === "price") {
            const aPrice = parseFloat(
                a.tags.find((tag) => tag[0] === "price")?.[1] || "0",
            );
            const bPrice = parseFloat(
                b.tags.find((tag) => tag[0] === "price")?.[1] || "0",
            );
            return aPrice - bPrice;
        }
        return 0;
    });

    // Extract NostrEvents from products
    const productEvents = sortedProducts.map((product) => {
        return {
            id: ProductListingUtils.getProductId(
                { tags: product.tags } as ProductListing,
            ) || "",
            content: product.content,
            tags: product.tags,
            created_at: product.created_at,
            pubkey: "",
            kind: 30402,
        } as ProductListing;
    });

    if (showForm) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ProductForm
                    event={editEvent}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value as "newest" | "price")}
                        className="px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price">Price: Low to High</option>
                    </select>

                    <button
                        onClick={handleCreateClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm  bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg
                            className="mr-2 -ml-1 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Add Product
                    </button>
                    <button
                        onClick={handleCreateSampleProductClick}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm  bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg
                            className="mr-2 -ml-1 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Sample Product
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500">
                    </div>
                    <span className="ml-3 text-lg text-gray-700">
                        Loading products...
                    </span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && productEvents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                        No products found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm
                            ? "Try adjusting your search."
                            : "Get started by creating a new product."}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productEvents.map((event) => (
                    <ProductCard
                        key={`${getProductId(event)}-${event.created_at}`}
                        event={event}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductLayout;
