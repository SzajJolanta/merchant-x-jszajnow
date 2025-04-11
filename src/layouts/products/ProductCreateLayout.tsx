import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ProductForm from "@/components/product/ProductForm";
import { useProductStore } from "@/stores/useProductStore";
import { ProductListing } from "nostr-commerce-schema";

const getSampleProduct = (): ProductListing => ({
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

const ProductCreateLayout: React.FC = () => {
    const { createProduct } = useProductStore();
    const [sampleData, setSampleData] = useState<ProductListing | undefined>();
    const [submitting, setSubmitting] = useState(false);
    const [location] = useLocation();

    useEffect(() => {
        if (location.includes("sample=true")) {
            setSampleData(getSampleProduct());
        }
    }, [location]);

    const handleFillSample = () => {
        setSampleData(getSampleProduct());
    };

    const handleSubmit = async (tags: string[][], content: string) => {
        setSubmitting(true);
        try {
            await createProduct({ kind: 30402, tags, content });
            window.history.back(); // Or navigate("/products")
        } catch (error) {
            console.error("Failed to create product:", error);
            // TODO: Add user-facing error message
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSampleData(undefined); // Clear form if needed
        window.history.back();
    };

    return (
        <div className="mx-auto px-4 py-8 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Create Product</h1>
                <button
                    onClick={handleFillSample}
                    className="btn-secondary"
                    disabled={submitting}
                >
                    Fill with Sample Data
                </button>
            </div>

            <ProductForm
                event={sampleData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                disabled={submitting}
            />

            {submitting && (
                <div className="text-center mt-4 text-sm text-gray-600">
                    Submitting product...
                </div>
            )}
        </div>
    );
};

export default ProductCreateLayout;
