import { create } from 'zustand';
import { getNdk } from "@/services/ndkService";
import { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
import { ProductListing, validateProductListing } from 'nostr-commerce-schema';


interface ProductState {
    products: Map<string, ProductListing>;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProducts: () => Promise<void>;
    createProduct: (product: Omit<ProductListing, 'created_at'>) => Promise<void>;
    updateProduct: (id: string, product: Partial<ProductListing>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: new Map<string, ProductListing>(),
    isLoading: false,
    error: null,

    fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const ndk = await getNdk();
            const subscription = ndk.subscribe({ kinds: [30402] });
            // TODO: Only fetch products from the Merchant Npub

            subscription.on("event", (event: NDKEvent) => {
                try {
                    console.log("Received event:", event);
                    const rawEvent = event.rawEvent();
                    // Parse the event content and tags
                    const content = rawEvent.content;
                    const tags = rawEvent.tags;

                    // Find product ID tag
                    const idTag = tags.find(tag => tag[0] === 'd');
                    if (!idTag || !idTag[1]) return;

                    const productId = idTag[1];

                    // Construct product object
                    const product = {
                        kind: 30402,
                        created_at: rawEvent.created_at || Math.floor(Date.now() / 1000),
                        content,
                        tags
                    };

                    // Validate with zod schema
                    try {
                        const validatedProductZodObj = validateProductListing(product);
                        if (!validatedProductZodObj.success) throw new Error("Invalid product data from fetched Event: " + JSON.stringify(validatedProductZodObj.error));

                        // Add to store
                        set(state => ({
                            products: new Map(state.products).set(productId, validatedProductZodObj.data)
                        }));
                    } catch (validationError) {
                        console.error("Invalid product data:", validationError);
                    }
                } catch (err) {
                    console.error("Error processing event:", err);
                }
            });

            set({ isLoading: false });
        } catch (error) {
            console.error("Failed to fetch products:", error);
            set({ isLoading: false, error: "Failed to fetch products" });
        }
    },

    createProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
            const ndk = await getNdk();

            // Create NDK event
            const event = new NDKEvent(ndk);
            const timestamp = Math.floor(Date.now() / 1000);

            // Construct product with current timestamp
            const product = {
                ...productData,
                created_at: timestamp
            };

            console.log("Creating product:", product);

            // Validate with schema
            const validatedProductZodObj = validateProductListing(product);
            if (!validatedProductZodObj.success) throw new Error("Issue creating Product: " + JSON.stringify(validatedProductZodObj.error));

            // Set event data
            event.kind = 30402;
            event.content = product.content;
            event.tags = product.tags as NDKTag[];
            event.created_at = timestamp;

            // Sign and publish event
            await event.sign();
            await event.publish();

            // Find product ID from tags
            const idTag = product.tags.find(tag => tag[0] === 'd');
            if (!idTag || !idTag[1]) throw new Error("Product ID missing");

            const productId = idTag[1];

            // Update local store
            set(state => ({
                isLoading: false,
                products: new Map(state.products).set(productId, product)
            }));
        } catch (error) {
            console.error("Failed to create product:", error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to create product"
            });
        }
    },

    updateProduct: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        try {
            const { products } = get();
            const existingProduct = products.get(id);

            if (!existingProduct) {
                throw new Error(`Product with ID ${id} not found`);
            }

            // Create updated product
            const updatedProduct = {
                ...existingProduct,
                ...updatedData,
                created_at: Math.floor(Date.now() / 1000)
            };

            // Validate with schema
            const validatedProductZodObj = validateProductListing(updatedProduct);
            if (!validatedProductZodObj.success) throw new Error("Issue updating Product: " + JSON.stringify(validatedProductZodObj.error));

            // Create and publish event
            const ndk = await getNdk();
            const event = new NDKEvent(ndk);

            event.kind = 30402;
            event.content = updatedProduct.content;
            event.tags = updatedProduct.tags as NDKTag[];
            event.created_at = updatedProduct.created_at;

            // Sign and publish
            await event.sign();
            await event.publish();

            // Update local store
            set(state => ({
                isLoading: false,
                products: new Map(state.products).set(id, updatedProduct)
            }));
        } catch (error) {
            console.error("Failed to update product:", error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to update product"
            });
        }
    },

    deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { products } = get();
            const existingProduct = products.get(id);

            if (!existingProduct) {
                throw new Error(`Product with ID ${id} not found`);
            }

            // Create deletion event
            const ndk = await getNdk();
            const event = new NDKEvent(ndk);

            event.kind = 5; // Deletion event kind
            event.content = '';
            event.tags = [
                ['e', id], // Event to delete
                ['k', '30402'] // Kind to delete
            ];

            // Sign and publish
            await event.sign();
            await event.publish();

            // Update local store
            set(state => {
                const newProducts = new Map(state.products);
                newProducts.delete(id);
                return {
                    isLoading: false,
                    products: newProducts
                };
            });
        } catch (error) {
            console.error("Failed to delete product:", error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to delete product"
            });
        }
    }
}));
