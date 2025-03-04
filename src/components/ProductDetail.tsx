import React, { useState } from "react";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";

const PLACEHOLDER_IMAGE = "/placeholder-product.png";

interface ProductDetailProps {
    event: NostrEvent;
    onEdit: (event: NostrEvent) => void;
    onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = (
    { event, onEdit, onBack },
) => {
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [imageError, setImageError] = useState(false);

    // Extract product details
    const id = ProductListingUtils.getProductId(
        event as unknown as ProductListing,
    );
    const title = ProductListingUtils.getProductTitle(
        event as unknown as ProductListing,
    );
    const price = ProductListingUtils.getProductPrice(
        event as unknown as ProductListing,
    );
    const images = ProductListingUtils.getProductImages(
        event as unknown as ProductListing,
    );
    const stock = ProductListingUtils.getProductStock(
        event as unknown as ProductListing,
    );
    const summary = ProductListingUtils.getProductSummary(
        event as unknown as ProductListing,
    );
    const specs = ProductListingUtils.getProductSpecs(
        event as unknown as ProductListing,
    );
    const weight = ProductListingUtils.getProductWeight(
        event as unknown as ProductListing,
    );
    const dimensions = ProductListingUtils.getProductDimensions(
        event as unknown as ProductListing,
    );
    const categories = ProductListingUtils.getProductCategories(
        event as unknown as ProductListing,
    );
    const type = ProductListingUtils.getProductType(
        event as unknown as ProductListing,
    );

    // If any required field is missing, don't render
    if (!id || !title || !price) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                    Invalid product data
                </h3>
                <button
                    onClick={onBack}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Go back
                </button>
            </div>
        );
    }

    const formattedPrice = `${price.amount}, ${price.currency}, ${
        price.frequency ?? ""
    }`.trim();
    const mainImage = images.length > 0 && !imageError
        ? images[0].url
        : PLACEHOLDER_IMAGE;

    const handleEdit = () => {
        onEdit(event);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={onBack}
                className="inline-flex items-center mb-6 text-indigo-600 hover:text-indigo-900"
            >
                <svg
                    className="h-5 w-5 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                Back to Products
            </button>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                    {/* Product Images */}
                    <div className="md:w-1/2">
                        <div className="relative pb-[75%] bg-gray-100">
                            <img
                                src={mainImage}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-contain p-4"
                                onError={() => setImageError(true)}
                                loading="lazy"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="flex overflow-x-auto p-4 space-x-2">
                                {images.map((image, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden ${
                                            selectedImage === idx
                                                ? "border-indigo-500"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`${title} - image ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={() => setImageError(true)}
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="md:w-1/2 p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h1>
                                {categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {categories.map((category) => (
                                            <span
                                                key={category}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                                <span className="ml-1">Edit</span>
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-3xl font-bold text-indigo-600 mb-4">
                                {formattedPrice}
                            </p>

                            {/* Stock status */}
                            {stock !== null && (
                                <div className="mb-4">
                                    {stock > 5 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            In Stock ({stock} available)
                                        </span>
                                    )}
                                    {stock <= 5 && stock > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            Low Stock (Only {stock} left)
                                        </span>
                                    )}
                                    {stock === 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Summary */}
                            {summary && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <p className="text-gray-700">{summary}</p>
                                </div>
                            )}

                            {/* Type */}
                            {(type.type || type.physicalType) && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                        Product Type
                                    </h3>
                                    <div className="flex space-x-4">
                                        {type.type && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                {type.type}
                                            </span>
                                        )}
                                        {type.physicalType && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                                {type.physicalType}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Specifications */}
                            {Object.keys(specs).length > 0 && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                        Specifications
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {Object.entries(specs).map((
                                            [key, value],
                                        ) => (
                                            <div key={key}>
                                                <dt className="text-sm font-medium text-gray-500">
                                                    {key}
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {value}
                                                </dd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Weight & Dimensions */}
                            {(weight || dimensions) && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                        Shipping Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {weight && weight.value && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">
                                                    Weight
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {`${weight.value} ${weight.unit}`}
                                                </dd>
                                            </div>
                                        )}
                                        {dimensions && dimensions.dimensions &&
                                            (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">
                                                        Dimensions (LxWxH)
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {`${dimensions.dimensions} ${dimensions.unit}`}
                                                    </dd>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Description */}
                {event.content && (
                    <div className="p-6 border-t border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Product Description
                        </h2>
                        <div className="prose max-w-none">{event.content}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
