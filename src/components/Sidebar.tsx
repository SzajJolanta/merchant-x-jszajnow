import { Link } from "wouter";

import "./Sidebar.css";
const Sidebar = () => {
    return (
        <nav className="sidebar fixed w-48 flex flex-col h-screen gap-4 justify-start items-start">
            <NavLink href="/store" isBold>Store</NavLink>
            <LinkList>
                <NavLink href="/store">Profile</NavLink>
                <NavLink href="/store/relays">Relays</NavLink>
                <NavLink href="/store/shipping">Shipping</NavLink>
                <NavLink href="/store/checkout">Checkout</NavLink>
            </LinkList>
            <NavLink href="/products" isBold>Products</NavLink>
            <LinkList>
                <NavLink href="/products">My Products</NavLink>
                <NavLink href="/products/create">Create Product</NavLink>
            </LinkList>
            <NavLink href="/orders/completed" isBold>Orders</NavLink>
            <LinkList>
                <NavLink href="/orders/completed">Completed</NavLink>
                <NavLink href="/orders/pending">Pending</NavLink>
                <NavLink href="/orders/failed">Failed</NavLink>
                <NavLink href="/orders/cancelled">Cancelled</NavLink>
                <NavLink href="/orders/create">Create New Order</NavLink>
            </LinkList>
        </nav>
    );
};

const NavLink = ({ href, isBold = false, children }: { href: string, isBold?: boolean, children: any }) => {
    return <Link href={href} className={`px-4 pt-2 w-full hover:opacity-50 hover:cursor-pointer ${isBold && 'font-bold'}`}>{children}</Link>
}

const LinkList = ({ children }: { children: any }) => {
    return (
        <div className={`flex flex-col ml-2 w-full *:text-sm -mt-4`}>
            {children}
        </div>
    )
}

export default Sidebar;
