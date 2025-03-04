import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { ProductListing, ProductListingUtils } from "nostr-commerce-schema";

interface ProductFormProps {
    event?: ProductListing;
    onSubmit: (tags: string[][], content: string) => Promise<void>;
    onCancel: () => void;
}

interface FormState {
    id: string;
    title: string;
    price: {
        amount: string;
        currency: string;
        frequency: string;
    };
    summary: string;
    content: string;
    stock: string;
    type: {
        type: "simple" | "variable" | "variation";
        physicalType: "digital" | "physical";
    };
    visibility: "hidden" | "on-sale" | "pre-order";
    images: Array<{
        url: string;
        dimensions?: string;
        order?: number;
    }>;
    specs: Array<{
        key: string;
        value: string;
    }>;
    weight: {
        value: string;
        unit: string;
    };
    dimensions: {
        dimensions: string;
        unit: string;
    };
    categories: string[];
}

const initialState: FormState = {
    id: uuidv4(),
    title: "",
    price: {
        amount: "",
        currency: "USD",
        frequency: "",
    },
    summary: "",
    content: "",
    stock: "",
    type: {
        type: "simple",
        physicalType: "physical",
    },
    visibility: "on-sale",
    images: [],
    specs: [],
    weight: {
        value: "",
        unit: "kg",
    },
    dimensions: {
        dimensions: "",
        unit: "cm",
    },
    categories: [],
};

const ProductForm: React.FC<ProductFormProps> = (
    { event, onSubmit, onCancel },
) => {
    const [formData, setFormData] = useState<FormState>(initialState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTab, setCurrentTab] = useState("basic");

    // If an event is provided, populate form with its data
    useEffect(() => {
        if (event) {
            const id = ProductListingUtils.getProductId(event) || uuidv4();
            const title = ProductListingUtils.getProductTitle(event) || "";
            const price = ProductListingUtils.getProductPrice(event) ||
                { amount: "--", currency: "USD" };
            const summary = ProductListingUtils.getProductSummary(event) || "";
            const content = event.content || "";
            const stock =
                ProductListingUtils.getProductStock(event)?.toString() || "";
            const type = ProductListingUtils.getProductType(event) ||
                { type: "simple", physicalType: "physical" };
            const visibility =
                ProductListingUtils.getProductVisibility(event) || "on-sale";
            const images = ProductListingUtils.getProductImages(event) || [];
            const weight = ProductListingUtils.getProductWeight(event) ||
                { value: "", unit: "kg" };
            const dimensions =
                ProductListingUtils.getProductDimensions(event) ||
                { dimensions: "", unit: "cm" };
            const categories =
                ProductListingUtils.getProductCategories(event) || [];

            // Convert specs object to array of {key, value} objects
            const specsObj = ProductListingUtils.getProductSpecs(event);
            const specs = Object.entries(specsObj).map(([key, value]) => ({
                key,
                value,
            }));

            setFormData({
                id,
                title,
                price: {
                    amount: price.amount || "",
                    currency: price.currency || "USD",
                    frequency: price.frequency || "",
                },
                summary,
                content,
                stock,
                type: {
                    type: type.type || "simple",
                    physicalType: type.physicalType || "physical",
                },
                visibility,
                images,
                specs: specs.length ? specs : [],
                weight,
                dimensions,
                categories,
            });
        }
    }, [event]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate required fields
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (!formData.price.amount.trim()) {
            newErrors.price = "Price is required";
        } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.amount)) {
            newErrors.price = "Price must be a valid number (e.g., 19.99)";
        }

        if (!formData.price.currency.trim()) {
            newErrors.currency = "Currency is required";
        }

        // Validate stock if provided
        if (formData.stock && !/^\d+$/.test(formData.stock)) {
            newErrors.stock = "Stock must be a whole number";
        }

        // Validate image URLs if provided
        formData.images.forEach((image, index) => {
            try {
                new URL(image.url);
            } catch (e) {
                newErrors[`image-${index}`] = "Invalid URL";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert form data to tags format
            const tags = ProductListingUtils.createProductTags({
                id: formData.id,
                title: formData.title,
                price: {
                    amount: formData.price.amount,
                    currency: formData.price.currency,
                    frequency: formData.price.frequency || undefined,
                },
                summary: formData.summary || undefined,
                stock: formData.stock
                    ? parseInt(formData.stock, 10)
                    : undefined,
                type: {
                    type: formData.type.type,
                    physicalType: formData.type.physicalType,
                },
                visibility: formData.visibility,
                images: formData.images.length ? formData.images : undefined,
                specs: formData.specs.length
                    ? formData.specs.reduce((acc, spec) => {
                        if (spec.key && spec.value) {
                            acc[spec.key] = spec.value;
                        }
                        return acc;
                    }, {} as Record<string, string>)
                    : undefined,
                weight: formData.weight.value
                    ? {
                        value: formData.weight.value,
                        unit: formData.weight.unit,
                    }
                    : undefined,
                dimensions: formData.dimensions.dimensions
                    ? {
                        dimensions: formData.dimensions.dimensions,
                        unit: formData.dimensions.unit,
                    }
                    : undefined,
                categories: formData.categories.length
                    ? formData.categories
                    : undefined,
            });

            await onSubmit(tags, formData.content);
        } catch (error) {
            console.error("Error submitting product:", error);
            setErrors({ submit: "Failed to submit product" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof FormState],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const addImage = () => {
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, { url: "" }],
        }));
    };

    const updateImage = (index: number, url: string) => {
        setFormData((prev) => {
            const newImages = [...prev.images];
            newImages[index] = { ...newImages[index], url };
            return { ...prev, images: newImages };
        });
    };

    const removeImage = (index: number) => {
        setFormData((prev) => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    const addSpec = () => {
        setFormData((prev) => ({
            ...prev,
            specs: [...prev.specs, { key: "", value: "" }],
        }));
    };

    const updateSpec = (
        index: number,
        field: "key" | "value",
        value: string,
    ) => {
        setFormData((prev) => {
            const newSpecs = [...prev.specs];
            newSpecs[index] = { ...newSpecs[index], [field]: value };
            return { ...prev, specs: newSpecs };
        });
    };

    const removeSpec = (index: number) => {
        setFormData((prev) => {
            const newSpecs = [...prev.specs];
            newSpecs.splice(index, 1);
            return { ...prev, specs: newSpecs };
        });
    };

    const addCategory = (category: string) => {
        if (category && !formData.categories.includes(category)) {
            setFormData((prev) => ({
                ...prev,
                categories: [...prev.categories, category],
            }));
        }
    };

    const removeCategory = (category: string) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.filter((c) => c !== category),
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
                {event ? "Edit Product" : "Create New Product"}
            </h2>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            currentTab === "basic"
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setCurrentTab("basic")}
                    >
                        Basic Info
                    </button>
                    <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            currentTab === "details"
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setCurrentTab("details")}
                    >
                        Details
                    </button>
                    <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            currentTab === "images"
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setCurrentTab("images")}
                    >
                        Images
                    </button>
                </nav>
            </div>

            <form onSubmit={handleSubmit}>
                {currentTab === "basic" && (
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Product Title*
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                    errors.title ? "border-red-500" : ""
                                }`}
                                required
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label
                                    htmlFor="price.amount"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Price*
                                </label>
                                <input
                                    type="text"
                                    id="price.amount"
                                    name="price.amount"
                                    value={formData.price.amount}
                                    onChange={handleChange}
                                    placeholder="19.99"
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                        errors.price ? "border-red-500" : ""
                                    }`}
                                    required
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="price.currency"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Currency*
                                </label>
                                <select
                                    id="price.currency"
                                    name="price.currency"
                                    value={formData.price.currency}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="JPY">JPY</option>
                                    <option value="CAD">CAD</option>
                                    <option value="AUD">AUD</option>
                                    <option value="BTC">BTC</option>
                                    <option value="SAT">SAT</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="price.frequency"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Frequency (optional)
                                </label>
                                <input
                                    type="text"
                                    id="price.frequency"
                                    name="price.frequency"
                                    value={formData.price.frequency}
                                    onChange={handleChange}
                                    placeholder="per month"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <label
                                htmlFor="summary"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Summary
                            </label>
                            <input
                                type="text"
                                id="summary"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                placeholder="Brief description of the product"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label
                                htmlFor="content"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Product Description
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                rows={5}
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Detailed description of the product"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Stock */}
                        <div>
                            <label
                                htmlFor="stock"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Stock
                            </label>
                            <input
                                type="text"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="Available quantity"
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                    errors.stock ? "border-red-500" : ""
                                }`}
                            />
                            {errors.stock && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.stock}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {currentTab === "details" && (
                    <div className="space-y-6">
                        {/* Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="type.type"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Product Type
                                </label>
                                <select
                                    id="type.type"
                                    name="type.type"
                                    value={formData.type.type}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="simple">Simple</option>
                                    <option value="variable">Variable</option>
                                    <option value="variation">Variation</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="type.physicalType"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Physical Type
                                </label>
                                <select
                                    id="type.physicalType"
                                    name="type.physicalType"
                                    value={formData.type.physicalType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="physical">Physical</option>
                                    <option value="digital">Digital</option>
                                </select>
                            </div>
                        </div>

                        {/* Visibility */}
                        <div>
                            <label
                                htmlFor="visibility"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Visibility
                            </label>
                            <select
                                id="visibility"
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="on-sale">On Sale</option>
                                <option value="hidden">Hidden</option>
                                <option value="pre-order">Pre-Order</option>
                            </select>
                        </div>

                        {/* Specifications */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Specifications
                                </label>
                                <button
                                    type="button"
                                    onClick={addSpec}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Add Spec
                                </button>
                            </div>

                            {formData.specs.map((spec, index) => (
                                <div
                                    key={index}
                                    className="flex space-x-2 mb-2"
                                >
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) =>
                                            updateSpec(
                                                index,
                                                "key",
                                                e.target.value,
                                            )}
                                        placeholder="Name"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) =>
                                            updateSpec(
                                                index,
                                                "value",
                                                e.target.value,
                                            )}
                                        placeholder="Value"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSpec(index)}
                                        className="inline-flex items-center p-1 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Weight & Dimensions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="weight.value"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Weight
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="weight.value"
                                        name="weight.value"
                                        value={formData.weight.value}
                                        onChange={handleChange}
                                        placeholder="Weight"
                                        className="flex-1 min-w-0 block rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <select
                                        id="weight.unit"
                                        name="weight.unit"
                                        value={formData.weight.unit}
                                        onChange={handleChange}
                                        className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                        <option value="oz">oz</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="dimensions.dimensions"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Dimensions (LxWxH)
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="dimensions.dimensions"
                                        name="dimensions.dimensions"
                                        value={formData.dimensions.dimensions}
                                        onChange={handleChange}
                                        placeholder="10x5x2"
                                        className="flex-1 min-w-0 block rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <select
                                        id="dimensions.unit"
                                        name="dimensions.unit"
                                        value={formData.dimensions.unit}
                                        onChange={handleChange}
                                        className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                                    >
                                        <option value="cm">cm</option>
                                        <option value="mm">mm</option>
                                        <option value="in">in</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Categories
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    id="new-category"
                                    placeholder="Add a category"
                                    className="flex-1 min-w-0 block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addCategory(
                                                (e.target as HTMLInputElement)
                                                    .value,
                                            );
                                            (e.target as HTMLInputElement)
                                                .value = "";
                                        }
                                    }}
                                />
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.categories.map((category) => (
                                    <span
                                        key={category}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                        {category}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeCategory(category)}
                                            className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:"
                                        >
                                            <span className="sr-only">
                                                Remove {category}
                                            </span>
                                            <svg
                                                className="h-2 w-2"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 8 8"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeWidth="1.5"
                                                    d="M1 1l6 6m0-6L1 7"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === "images" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Images
                            </label>
                            <button
                                type="button"
                                onClick={addImage}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Image
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {formData.images.map((image, index) => (
                                <div
                                    key={index}
                                    className="flex space-x-2 items-center"
                                >
                                    <div className="flex-grow">
                                        <input
                                            type="text"
                                            value={image.url}
                                            onChange={(e) =>
                                                updateImage(
                                                    index,
                                                    e.target.value,
                                                )}
                                            placeholder="Image URL"
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                                errors[`image-${index}`]
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />
                                        {errors[`image-${index}`] && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors[`image-${index}`]}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="inline-flex items-center p-1 border border-transparent rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {formData.images.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                    Preview
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative pb-[100%] bg-gray-100 rounded-md overflow-hidden"
                                        >
                                            {image.url && (
                                                <img
                                                    src={image.url}
                                                    alt={`Product image ${
                                                        index + 1
                                                    }`}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    onError={(e) => {
                                                        // Show a placeholder for broken images
                                                        (e.target as HTMLImageElement)
                                                            .src =
                                                                "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%25%22%20height%3D%22100%25%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%3Cpath%20fill%3D%22%23f3f4f6%22%20d%3D%22M0%200h100v100H0z%22%2F%3E%3Cpath%20fill%3D%22%23d1d5db%22%20d%3D%22M40%2035l20%2030l15-15l25%2030V0H0v80l25-25z%22%2F%3E%3Ccircle%20cx%3D%2275%22%20cy%3D%2225%22%20r%3D%228%22%20fill%3D%22%23d1d5db%22%2F%3E%3C%2Fsvg%3E";
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Error message */}
                {errors.submit && (
                    <div className="mt-4 text-sm text-red-600">
                        {errors.submit}
                    </div>
                )}

                {/* Form actions */}
                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm  bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 "
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        >
                                        </circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        >
                                        </path>
                                    </svg>
                                    {event ? "Updating..." : "Creating..."}
                                </>
                            )
                            : <>{event ? "Update Product" : "Create Product"}
                            </>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
