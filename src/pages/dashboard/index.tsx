
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import DashboardLayout from "~/layouts/Dashboard";
import { toast } from "react-hot-toast";
import abi from "../../constants/abi.json";
import contractAddress from "../../constants/contractAddress.json";
import { useRouter } from "next/router";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { api } from "~/utils/api";


const Dashboard: NextPage = () => {
  const router = useRouter()
  const {  enableWeb3, account, isWeb3Enabled, deactivateWeb3, Moralis } = useMoralis()
  const countData = (status: boolean) : number => {
    const { data } = api.edp.count.useQuery({
      status: status
    });
    return data || 0
  }
  const countAll = () : number => {
    const { data } = api.edp.countAll.useQuery()
    return data || 0
  }

  const { runContractFunction: isOwner } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress["11155111"][0],
    functionName: "isOwner",
    params: {
    },
  })

  const isAccountOwner = async () => {
    const isOwnerResult = await isOwner();
    if (isOwnerResult == false) {
      router.push('/')
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      isAccountOwner()
    }
    if (window.localStorage.getItem("connected")) {
      enableWeb3()
    }
  }, [isWeb3Enabled])

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log('Account change')
      if (account == null) {
        window.localStorage.removeItem("connected")
        deactivateWeb3()
      }
    })
  }, [account])
  return (
    <>
      <DashboardLayout>
        <div>
          <div className="p-4">
            <p className="text-lg p-2">Selamat Datang</p>
          </div>          
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:gap-8">
            <a href="#" className="block max-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Total Dokumen</h5>
              <p className="text-xl">{countAll()}</p>
            </a>
            <a href="#" className="block max-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dokumen di Blockchain</h5>
              <p className="text-xl">{countData(true)}</p>
            </a>
            <a href="#" className="block max-w-full p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dokumen di Lokal</h5>
              <p className="text-xl">{countData(false)}</p>
            </a>
          </div>
        </div>
      </DashboardLayout>

    </>
  );
};

export default Dashboard;
