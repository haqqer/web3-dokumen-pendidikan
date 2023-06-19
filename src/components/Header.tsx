import { useMoralis } from "react-moralis";

const Header = () => {

    const { enableWeb3, isWeb3EnableLoading, isWeb3Enabled } = useMoralis()
    return (
        <div className="flex justify-end px-6 py-3">
            <button className="p-2 text-l rounded-xl bg-yellow-300 animate-pulse" onClick={async () => {await enableWeb3()}}>
                Connect Wallet
            </button>
        </div>
    )
}

export default Header;