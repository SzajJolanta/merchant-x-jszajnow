import React from "react";
import { useProductStore } from "@/stores/useProductStore";
import ProductForm from "@/components/product/ProductForm";
import { useRoute } from "wouter";

const ProductEditorLayout: React.FC = () => {
    const [match, params] = useRoute("/products/edit/:id");
    const { products, updateProduct } = useProductStore();

    if (!match || !params?.id) {
        return <div>Invalid Product ID</div>;
    }

    const product = products.get(params.id);

    const handleSubmit = async (tags: string[][], content: string) => {
        await updateProduct(params.id, {
            tags,
            content,
            created_at: Math.floor(Date.now() / 1000),
        });
        window.history.back();
    };

    console.log("Rendering ProductsEditorLayout"); // or CreateLayout, EditorLayout


    return (
        <div className="mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
            <ProductForm
                event={product}
                onSubmit={handleSubmit}
                onCancel={() => window.history.back()}
            />
        </div>
    );
};

export default ProductEditorLayout;
