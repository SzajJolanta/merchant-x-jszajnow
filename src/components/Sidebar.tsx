import { Link } from "wouter";

import "./Sidebar.css";
const Sidebar = () => {
    return (
        <nav className="sidebar fixed w-48 flex flex-col h-screen gap-4 justify-start items-start">
            <NavLink href="/store/relays">Store</NavLink>
            <LinkList>
                <NavLink href="/store/relays">Relays</NavLink>
                <NavLink href="/store/shipping">Shipping</NavLink>
            </LinkList>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/orders">Orders</NavLink>
        </nav>
    );
};

const NavLink = ({ href, children }: { href: string, children: any }) => {
    return <Link href={href} className='px-4 pt-2 w-full hover:opacity-50 hover:cursor-pointer'>{children}</Link>
}

const LinkList = ({ children }: { children: any }) => {
    return (
        <div className='flex flex-col ml-2 w-full *:text-sm -mt-4'>
            {children}
        </div>
    )
}

export default Sidebar;
