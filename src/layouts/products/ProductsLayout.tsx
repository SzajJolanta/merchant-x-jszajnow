import React, { useState } from "react";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { useProductStore } from "@/stores/useProductStore";
import ProductEditorLayout from "@/layouts/products/ProductEditorLayout";
import ProductDetail from "@/components/product/ProductDetail";
import ProductForm from "@/components/product/ProductForm";
import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";

const ProductsLayout: React.FC = () => {
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
                    <ProductEditorLayout
                        onViewProduct={handleViewProduct}
                        onEditProduct={handleEditProduct}
                        onCreateProduct={handleCreateProduct}
                    />
                );
        }
    };

    return (
        <div className="">
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default ProductsLayout;
