import React from "react";
import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";

interface ProductCardProps {
    event: ProductListing;
    onEdit: (event: ProductListing) => void;
    onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = (
    { event, onEdit, onDelete },
) => {
    const id = ProductListingUtils.getProductId(event);
    const title = ProductListingUtils.getProductTitle(event);
    const price = ProductListingUtils.getProductPrice(event);
    const images = ProductListingUtils.getProductImages(event);
    const stock = ProductListingUtils.getProductStock(event);
    const summary = ProductListingUtils.getProductSummary(event);

    // If any required field is missing, don't render the card
    if (!id || !title || !price) {
        return null;
    }

    const formattedPrice = `${price.amount}, ${price.currency}, ${
        price.frequency ?? ""
    }`.trim();
    const mainImage = images.length > 0
        ? images[0].url
        : "/placeholder-product.png";

    const handleEdit = () => {
        onEdit(event);
    };

    const handleDelete = () => {
        if (
            id &&
            window.confirm("Are you sure you want to delete this product?")
        ) {
            onDelete(id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105">
            <div className="relative pb-[75%] overflow-hidden bg-gray-100">
                <img
                    src={mainImage}
                    alt={title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback for failed image loads
                        (e.target as HTMLImageElement).src =
                            "/placeholder-product.png";
                    }}
                />
                {stock !== null && stock <= 5 && stock > 0 && (
                    <span className="absolute top-2 right-2 bg-amber-500  text-xs font-bold px-2 py-1 rounded">
                        Only {stock} left
                    </span>
                )}
                {stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500  text-xs font-bold px-2 py-1 rounded">
                        Out of stock
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                    {title}
                </h3>

                {summary && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {summary}
                    </p>
                )}

                <div className="flex justify-between items-center mt-2">
                    <p className="text-lg font-bold text-indigo-600">
                        {formattedPrice}
                    </p>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleEdit}
                            className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                            aria-label="Edit product"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                            </svg>
                        </button>

                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            aria-label="Delete product"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
