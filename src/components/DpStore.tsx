// import { useWeb3Contract } from "react-moralis"
// import abi from "../constants/abi.json";
// import contractAddress from "../constants/contractAddress.json";
// import { useMoralis  } from "react-moralis";
// import { useEffect } from "react";

// const DpStore = () => {
//     const { chainId, enableWeb3, isWeb3EnableLoading, account, isWeb3Enabled, deactivateWeb3, Moralis } = useMoralis()

//     const { runContractFunction: owner } = useWeb3Contract({
//         abi: abi,
//         contractAddress: contractAddress["11155111"][0],
//         functionName: "owner",
//         params: {
//         },
//     }) 

//     const { runContractFunction: isOwner } = useWeb3Contract({
//         abi: abi,
//         contractAddress: contractAddress["11155111"][0],
//         functionName: "isOwner",
//         params: {
//         },
//     })

//     const { runContractFunction: HashIdentity } = useWeb3Contract({
//         abi: abi,
//         contractAddress: contractAddress["11155111"][0],
//         functionName: "HashIdentity",
//         params: {
//             "_nim": "A11.2017.10417",
//             "_nama": "MUHAMMAD ILHAM HAQQI",
//             "_tglLahir": "12-10-1999",
//             "_jenis": "ijazah", 
//             "_attributes": "{}"
//         },
//     }) 
//     useEffect(() => {
//         console.log(parseInt(chainId || ""))
//         if (isWeb3Enabled) {
//             async function getOwner() {
//                 const ownerResult = await owner();
//                 console.log("onwer")
//                 console.log(ownerResult)
//                 const isOwnerResult = await isOwner();
//                 console.log("isOwner")
//                 console.log(isOwnerResult)
//                 console.log("hash identity")
//                 const hashIdentityResult = await HashIdentity();
//                 console.log(hashIdentityResult)
//             }
//             getOwner()
//             return
//         }
//         if (window.localStorage.getItem("connected")) {
//             enableWeb3()
//         }
//     }, [isWeb3Enabled])
  
//     useEffect(() => {
//       Moralis.onAccountChanged((account) => {
//         console.log('Account change')
//         if (account == null) {
//           window.localStorage.removeItem("connected")
//           deactivateWeb3()
//         }
//       })
//     }, [])
//     return (
//         <div>
//             Dashboard
//         </div>
//     )
// }

// export default DpStore