import "./Sidebar.css";
const Sidebar = () => {
    return (
        <nav className="sidebar fixed w-48 flex flex-col h-screen gap-2 justify-start items-start border-r-2 *:p-4 *:border-b-2 *:w-full *:hover:opacity-50 *:hover:cursor-pointer">
            <button>Store</button>
            <button>Products</button>
            <button>Orders</button>
            <button>Customers</button>
        </nav>
    );
};

export default Sidebar;
