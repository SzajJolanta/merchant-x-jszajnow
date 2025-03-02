import { getNdk } from "@/services/ndkService";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { useEffect, useState } from "preact/hooks";

const ndk = await getNdk();

const useProductSubscription = () => {
    const [products, setProducts] = useState<Set<NostrEvent>>(new Set()); // TODO: Hoist to context

    useEffect(() => {
        console.log("Subscribing to events");

        const subscription = ndk.subscribe({
            kinds: [30018, 30402]
        });

        subscription.on("event", (event: NDKEvent) => {
            setProducts((prev) => {
                const newSet = new Set(prev);
                const rawEvent = event.rawEvent();
                if (!newSet.has(rawEvent)) {
                    newSet.add(rawEvent);
                    return newSet;
                }
                return prev; // Prevent unnecessary state update
            });
        });

    }, []);

    return {
        products
    }
}

export default useProductSubscription;
