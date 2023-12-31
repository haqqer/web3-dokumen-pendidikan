import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../constants/abi.json";
import contractAddress from "../constants/contractAddress.json";
import { useRouter } from 'next/router'
import { toast } from "react-hot-toast";

const Home: NextPage = () => {
  const router = useRouter()
  const { chainId, enableWeb3, isWeb3EnableLoading, account, isWeb3Enabled, deactivateWeb3, Moralis } = useMoralis()

  const { runContractFunction: isOwner } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress["11155111"][0],
    functionName: "isOwner",
    params: {
    },
  })

  const goToDashboard = async () => {
    const isOwnerResult = await isOwner();
    if (isOwnerResult == false) {
      toast.error("Bukan Admin");
      return
    }
    router.push('/dashboard')
  }
  useEffect(() => {
    if (isWeb3Enabled) return
    if (window.localStorage.getItem("connected")) {
      enableWeb3()
    }
    // enableWeb3()
    console.log(isWeb3Enabled)
  }, [isWeb3Enabled])

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log('Account change')
      if (account == null) {
        window.localStorage.removeItem("connected")
        deactivateWeb3()
      }
    })
  }, [])
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Web3 <span className="text-[hsl(280,100%,70%)]">-</span> Dokumen Pendidikan
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="p-3 text-lg rounded-xl bg-yellow-500 text-center"
              href="/validasi"
              target="_blank"
            >
              Validasi
            </Link>
            {!isWeb3Enabled && <button className="p-3 text-lg rounded-xl bg-yellow-500 text-center" onClick={async () => {
              await enableWeb3()
              window.localStorage.setItem("connected", "injected")
            }}>
                Connect Wallet
            </button>}
            {isWeb3Enabled && <button className="p-3 text-lg rounded-xl bg-yellow-500 text-center" onClick={async () => {
              await goToDashboard()
            }}>
                Dashboard
            </button>}
          </div>
          <p className="text-2xl text-white">
          </p>
        </div>
      </main>
  </>
  );
};

export default Home;
