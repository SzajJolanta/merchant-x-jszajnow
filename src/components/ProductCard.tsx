import { NostrEvent } from "@nostr-dev-kit/ndk";

const ProductCard = ({ productEvent }: { productEvent: NostrEvent }) => {
    const { content } = productEvent;
    const { name } = JSON.parse(content);

    return (
        <div className="border-2 border-white m-4 p-4 overflow-hidden">
            <p>{name}</p>
        </div>
    );
};

export default ProductCard;
