import React, { useEffect, useRef, useState } from "react";
import { useAccountStore } from "@/stores/useAccountStore";

const Header: React.FC = () => {
    const { user, isLoggedIn, logout } = useAccountStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [displayName, setDisplayName] = useState<string>("");

    const formatNpub = (npub: string): string => {
        if (!npub) return "";
        return `${npub.substring(0, 8)}...${npub.substring(npub.length - 8)}`;
    };

    const handleLogout = async () => {
        logout();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchUserMetadata = async () => {
            if (user && user.npub) {
                try {
                    const userProfile = await user.fetchProfile();

                    if (userProfile && userProfile.displayName) {
                        setDisplayName(userProfile.displayName);
                    } else if (userProfile && userProfile.name) {
                        setDisplayName(userProfile.name);
                    } else {
                        setDisplayName(formatNpub(user.npub));
                    }
                } catch (error) {
                    console.error("Error fetching user metadata:", error);
                    setDisplayName(formatNpub(user.npub));
                }
            }
        };

        if (isLoggedIn) {
            fetchUserMetadata();
        }
    }, [user, isLoggedIn]);

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo/Title */}
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-800">
                        Merchant Experience
                    </h1>
                </div>

                {/* Account Component */}
                {isLoggedIn && user
                    ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                {/* User Avatar - Default to a circle with first letter or icon */}
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                    {displayName
                                        ? displayName.charAt(0).toUpperCase()
                                        : "N"}
                                </div>

                                <span className="hidden sm:inline text-sm font-medium">
                                    {displayName || formatNpub(user.npub)}
                                </span>

                                {/* Dropdown Arrow */}
                                <svg
                                    className={`w-4 h-4 transition-transform ${
                                        dropdownOpen ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1">
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-xs text-gray-500">
                                                Signed in as
                                            </p>
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {formatNpub(user.npub)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                    : null}
            </div>
        </header>
    );
};

export default Header;
