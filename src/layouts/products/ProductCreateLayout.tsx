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
    const [productData, setProductData] = useState<ProductListing | undefined>();
    const [location] = useLocation();
    const [submitting, setSubmitting] = useState(false);

    // Auto-fill sample data if ?sample=true
    useEffect(() => {
        if (location.includes("sample=true")) {
            setProductData(getSampleProduct());
        }
    }, [location]);

    // Handler for manual fill with sample button
    const handleFillSample = () => {
        setProductData(getSampleProduct());
    };

    const handleSubmit = async (tags: string[][], content: string) => {
        setSubmitting(true);
        try {
            await createProduct({
                kind: 30402,
                tags,
                content,
            });
            console.log("✅ Product created");
            window.history.back(); // or navigate("/products");
        } catch (err) {
            console.error("❌ Failed to create product:", err);
            // TODO: Add user-facing error message
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setProductData(undefined);
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
                    style={'background: red'}
                >
                    Fill with Sample Data
                </button>
            </div>

            <ProductForm
                event={productData}
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
