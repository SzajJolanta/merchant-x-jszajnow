import useRelaySub from "@/hooks/useRelaySub";
import ProductCard from "./ProductCard";

const MyProducts = () => {
    const { products } = useRelaySub();

    return (
        <div>
            <h1>My Products</h1>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...products].map((product: any) => (
                    <ProductCard key={product.id} productEvent={product} />
                ))}
            </section>
        </div>
    );
};

export default MyProducts;
