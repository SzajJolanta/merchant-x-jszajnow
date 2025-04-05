import config from "@root/config";

const RelayPoolsLayout = () => {
    return (
        <section className="mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">
                Nostr Relay Pools
            </h1>
            <p className="mb-6">
                Welcome to the Nostr Relay Pools client. This is where you can
                manage your Relay Pools and view their status.
            </p>
            <div className="border-2 border-white m-4 p-4">
                {config.relays.map((relay: string) => <p key={relay}>{relay}
                </p>)}
            </div>
        </section>
    );
};

export default RelayPoolsLayout;
