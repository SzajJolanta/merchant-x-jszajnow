import React from "react";
import { useAccountStore } from "@/stores/useAccountStore";

interface LoginLayoutProps {
    children: React.ReactNode;
}

export const useInitializeAuth = () => {
    const fetchUser = useAccountStore((state) => state.fetchUser);
    const isLoggedIn = useAccountStore((state) => state.isLoggedIn);

    React.useEffect(() => {
        if (isLoggedIn) {
            fetchUser();
        }
    }, [fetchUser, isLoggedIn]);
};

const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
    useInitializeAuth();
    const { isLoggedIn, login } = useAccountStore();

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold mb-4">
                        Nostr Account Required
                    </h1>
                    <p className="mb-6">
                        To use the Merchant Experience client, you need to log
                        in with a Nostr account.
                    </p>
                    <button
                        onClick={() =>
                            login().catch((err) =>
                                console.error("Login error:", err)
                            )}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                        Login with Nostr
                    </button>
                </div>
            </div>
        );
    }

    // User is logged in, render the children (main app content)
    return <>{children}</>;
};

export default LoginLayout;
