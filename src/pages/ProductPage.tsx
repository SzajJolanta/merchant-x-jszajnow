import React, { useState } from "react";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { useProductStore } from "@/stores/useProductStore";
import ProductLayout from "@/layouts/ProductLayout";
import ProductDetail from "@/components/ProductDetail";
import ProductForm from "@/components/ProductForm";
import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";

const ProductsPage: React.FC = () => {
    const { createProduct, updateProduct } = useProductStore();
    const [currentView, setCurrentView] = useState<"list" | "detail" | "form">(
        "list",
    );
    const [selectedEvent, setSelectedEvent] = useState<NostrEvent | undefined>(
        undefined,
    );

    // Handle view product details
    const handleViewProduct = (event: NostrEvent) => {
        setSelectedEvent(event);
        setCurrentView("detail");
    };

    // Handle edit product
    const handleEditProduct = (event: NostrEvent) => {
        setSelectedEvent(event);
        setCurrentView("form");
    };

    // Handle create new product
    const handleCreateProduct = () => {
        setSelectedEvent(undefined);
        setCurrentView("form");
    };

    // Handle form submission
    const handleFormSubmit = async (tags: string[][], content: string) => {
        if (selectedEvent) {
            // Update existing product
            const id = ProductListingUtils.getProductId(
                selectedEvent as unknown as ProductListing,
            );
            if (!id) {
                console.error("Cannot update: missing product ID");
                return;
            }

            await updateProduct(id, {
                tags,
                content,
                created_at: Math.floor(Date.now() / 1000),
            });
        } else {
            // Create new product
            await createProduct({
                kind: 30402,
                tags,
                content,
            });
        }

        // Go back to list view
        setCurrentView("list");
        setSelectedEvent(undefined);
    };

    // Handle cancellation
    const handleCancel = () => {
        setCurrentView("list");
        setSelectedEvent(undefined);
    };

    // Render the appropriate view
    const renderContent = () => {
        switch (currentView) {
            case "detail":
                if (!selectedEvent) return <div>No product selected</div>;
                return (
                    <ProductDetail
                        event={selectedEvent}
                        onEdit={handleEditProduct}
                        onBack={() => setCurrentView("list")}
                    />
                );
            case "form":
                return (
                    <ProductForm
                        event={selectedEvent}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                    />
                );
            case "list":
            default:
                return (
                    <ProductLayout
                        onViewProduct={handleViewProduct}
                        onEditProduct={handleEditProduct}
                        onCreateProduct={handleCreateProduct}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen">
            <header className="">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Merchant X
                    </h1>
                    <p className="text-sm text-gray-500">
                        The Merchant Experience for Nostr Rockstars
                    </p>
                </div>
            </header>

            <main>
                {renderContent()}
            </main>

            <footer className="mt-8">
                <div className="container mx-auto px-4 py-6">
                    <p className="text-center text-gray-500 text-sm">
                        Powered by Nostr - Kind 30402 Product Listing
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ProductsPage;
