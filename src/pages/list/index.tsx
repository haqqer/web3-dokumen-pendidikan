import type { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";
import DashboardLayout from "~/layouts/Dashboard";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
// import abi from "../../constants/abi.json";
// import contractAddress from "../../constants/contractAddress.json";
import { useRouter } from "next/router";
import { useMoralis, useWeb3Contract } from "react-moralis";
import Datepicker from "tailwind-datepicker-react";

type DataProps = {
  ipfsHttpUrl: string;
  contractAddress: string
  abi: any
}

const ListDokumen: NextPage<DataProps> = ({ contractAddress, abi, ipfsHttpUrl }) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [buttonName, setButtonName] = useState("Tambah");

  // form
  const [id, setId] = useState<string>("");
  const [nim, setNim] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [tglLahir, setTglLahir] = useState<string>("");
  const [jenis, setJenis] = useState<string>("");
  const [atribut, setAtribut] = useState<any>({});
  const [status, setStatus] = useState<boolean>(false);


  // dpStore
  const [identityHash, setIdentityHash] = useState<string>("");
  const [hashFile, setHashFile] = useState<string>("");
  const [ipfsAddress, setIpfsAddress] = useState<string>("");
  const [storeBlockchain, setStoreBlockchain] = useState<boolean>(false);

  // file upload
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [valueDatePicker, setValueDatePicker] = useState<Date>();

  // check admin
  const router = useRouter()
  const { enableWeb3, account, isWeb3Enabled, deactivateWeb3, Moralis } = useMoralis()

  // date picker
  const options = {
    title: "Demo Title",
    autoHide: true,
    todayBtn: false,
    clearBtn: true,
    maxDate: new Date("2030-01-01"),
    minDate: new Date("1950-01-01"),
    theme: {
      background: "bg-gray-700 dark:bg-gray-800",
      todayBtn: "",
      clearBtn: "",
      icons: "",
      text: "",
      disabledText: "bg-red-500",
      input: "",
      inputIcon: "",
      selected: "",
    },
    icons: {
      // () => ReactElement | JSX.Element
      prev: () => <span>Previous</span>,
      next: () => <span>Next</span>,
    },
    datepickerClassNames: "top-12",
    defaultDate: new Date("2022-01-01"),
    language: "en",
  }

  function addOneDay(input: string): string {
    const date = new Date(input)
    const result = date.setDate(date.getDate() + 1)
    return (new Date(result)).toISOString().split('T')[0] || ""
  }

  function subOneDay(input: string): string {
    const date = new Date(input)
    const result = date.setDate(date.getDate() - 1)
    return (new Date(result)).toISOString().split('T')[0] || ""
  }

  const [showDatePicker, setShowDatePicker] = useState<boolean>()
	const handleClose = (state: boolean) => {
		setShowDatePicker(state)
	}

  const { runContractFunction: isOwner } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "isOwner",
    params: {
    },
  })
  // 0xcc6122e4229f7ba7eaddcf45ddc8b1e38a5799ea5f2e323b38381dc794315879,0x38062d3c84b64599098fb6bee879e391,QmPbbjbcg3s5JkE454qkEjgoFA8Y17qRFqZCmTGcV7muhR
  const { runContractFunction: StoreDocument } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "StoreDocument"
  })

  const { runContractFunction: HashIdentity } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "HashIdentity",
  })

  // smart contract function
  const isAccountOwner = async () => {
    const isOwnerResult = await isOwner();
    if (isOwnerResult == false) {
      router.push('/')
    }
  }

  const processHashIdentity = async (params: Record<string, unknown>) => {
    const hashIdentityResult = await HashIdentity({ params: params })
    return hashIdentityResult
  }
  const processStoreDocument = async (params: Record<string, unknown>): Promise<Boolean> => {
    const storeDocumentResult = await StoreDocument({ params: params })
    if (storeDocumentResult != undefined || storeDocumentResult != null) {
      return true
    }
    return false
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
  //submit 
  const ctx = api.useContext();

  const { data, isLoading: isGetAllLoading } = api.edp.getAll.useQuery();

  const { mutate: addData, isLoading: isAddDataLoading } = api.edp.create.useMutation({
    onSuccess: () => {
      setNim("");
      setNama("");
      setTglLahir("");
      setJenis("");
      setAtribut("");
      setIpfsAddress("");
      setHashFile("");
      void ctx.edp.getAll.invalidate()
    },
    onError: (e) => {
      const errMessage = e.data?.zodError?.fieldErrors.content;

      if (errMessage && errMessage[0]) {
        toast.error(errMessage[0]);
      } else {
        toast.error("Failed to post try again later!");
      }
    }
  });

  const { mutate: updateData, isLoading: isUpdateDataLoading } = api.edp.update.useMutation({
    onSuccess: () => {
      setId("");
      setNim("");
      setNama("");
      setTglLahir("");
      setJenis("");
      setAtribut("");
      setIpfsAddress("");
      setHashFile("");
      setShowModal(false);
      void ctx.edp.getAll.invalidate()
    },
    onError: (e) => {
      const errMessage = e.data?.zodError?.fieldErrors.content;

      if (errMessage && errMessage[0]) {
        toast.error(errMessage[0]);
      } else {
        toast.error("Failed to edit try again later!");
      }
    }
  });

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("file", selectedFile);
      const data = await fetch("/api/ipfs", {
        body: formData,
        method: 'POST'
      });
      if (data) {
        toast.success("Berkas berhasil diupload");
      }
      const result = await data.json()
      return result
    } catch (error: any) {
      toast.error("Error upload");
      console.log(error.response?.data);
    }
    setUploading(false);
  };
  return (  
    <>
      <DashboardLayout>
        <div className="flex justify-end pb-4">
          <div className="p-4">
            <button onClick={() => {
              setShowModal(true)
              setButtonName("Tambah")
              setNim("")
              setNama("")
              setTglLahir("")
              setJenis("")
              setAtribut("")
            }} className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
              Tambah
            </button>
          </div>
          {/* Modal toggle */}
          {/* Main modal */}
          {showModal ? 
          (
            <div>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-full max-w-md max-h-full">
                  {/* Modal content */}
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button onClick={() => setShowModal(false)} type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                    <div className="px-6 py-6 lg:px-8">
                      <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Tambah Dokumen Pendidikan</h3>
                      <div className="space-y-6" >
                        <div>
                          <label htmlFor="nim" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                          <input value={nim} onChange={(e) => setNim(e.target.value)} type="text" name="nim" id="nim" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="A11.2017.xxx" required />
                        </div>
                        <div>
                          <label htmlFor="nama" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Lengkap</label>
                          <input value={nama} onChange={(e) => setNama(e.target.value)} type="text" name="nama" id="nama" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Nama lengkap" required />
                        </div>
                        <div>
                          <label htmlFor="tglLahir" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tanggal Lahir</label>
                          <Datepicker options={options} onChange={(e: Date) => {
                            const tglLahir = e.toISOString().split('T')[0]
                            setTglLahir(addOneDay(tglLahir || ""))
                          }} show={showDatePicker} setShow={handleClose} />
                        </div>
                        <div>
                          <label htmlFor="jenis" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Jenis</label>
                          <input value={jenis} onChange={(e) => setJenis(e.target.value)} type="text" name="jenis" id="jenis" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Jenis" required />
                        </div>
                        <div>
                          <label htmlFor="atribut" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Atribut</label>
                          <input value={atribut} onChange={(e) => setAtribut(e.target.value)} type="text" name="atribut" id="atribut" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Atribut" required />
                        </div>
                        <div>
                          <label htmlFor="file" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Berkas Dokumen</label>
                          <input 
                          onChange={({ target }) => {
                            if (target.files) { 
                              const file = target.files[0];
                              setSelectedFile(file);
                            }
                          }}
                          type="file" name="file" id="file" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Atribut" required />
                        </div>
                        {buttonName == "Tambah" && (<div className="flex items-center mb-4">
                          <input checked={storeBlockchain} onChange={(e) => setStoreBlockchain(e.target.checked)} id="storeBlockchain" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                          <label htmlFor="storeBlockchain" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Simpan ke blockcahin?</label>
                        </div>)}                
                        {!isAddDataLoading && buttonName == "Tambah" && (<button onClick={async() =>{ 
                          if (selectedFile == undefined) {
                            addData({nim: nim, nama: nama, tglLahir: tglLahir, jenis: jenis, atribut: atribut, ipfsCid: "", fileHash: "", status: false})
                            setShowModal(false)
                            return 
                          }
                          const uploadResult = await handleUpload()
                          if (uploadResult.cid != "") {
                            addData({nim: nim, nama: nama, tglLahir: tglLahir, jenis: jenis, atribut: atribut, ipfsCid: uploadResult.cid, fileHash: uploadResult.hash, status: true})
                            if (storeBlockchain) {
                              const hashIdentityResult = await processHashIdentity({ 
                                params: {
                                  "_nim": nim,
                                  "_nama": nama,
                                  "_tglLahir": tglLahir,
                                  "_jenis": jenis,
                                  "_attributes": atribut,
                                }
                              })
                              const storeDocumentResult = await processStoreDocument({
                                params: {
                                  "_identityHash": hashIdentityResult,
                                  "_hashFile": "0x"+hashFile,
                                  "_ipfsAddress": ipfsAddress
                                }
                              })
                              if(storeDocumentResult) {
                                toast.success("Data berhasil disimpan ke blockchain")
                              } else {
                                toast.error("Data gagal disimpan ke blockchain!")
                              }
                            }
                          } else {
                            toast.error("Gagal upload berkas")
                          }
                          setShowModal(false);
                        }} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{buttonName}</button>)}
                        {!isUpdateDataLoading && buttonName == "Edit" && (<button onClick={async() =>{ 
                          console.log(selectedFile)
                          if (selectedFile != undefined) { 
                            const uploadResult = await handleUpload()
                            updateData({id: id, nim: nim, nama: nama, tglLahir: tglLahir, jenis: jenis, atribut: atribut, ipfsCid: uploadResult.cid, fileHash: uploadResult.hash, status: status})
                            toast.success("Data berhasil di edit")
                          } else {
                            updateData({id: id, nim: nim, nama: nama, tglLahir: tglLahir, jenis: jenis, atribut: atribut, ipfsCid: ipfsAddress, fileHash: hashFile, status: status})
                          }

                        }} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{buttonName}</button>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>            
            </div>
          )
          : null}
          {/* Confirmation Modal */}
          {showConfirmation ? 
          (
            <div>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-full max-w-lg max-h-full">
                  {/* Modal content */}
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button onClick={() => setShowConfirmation(false)} type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                    <div className="px-6 py-6 lg:px-8">
                      <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Konfirmasi Simpan ke Blockchain</h3>
                      <div className="space-y-6" >
                        <div>
                          <label htmlFor="nim" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                          <p className="block w-full">{nim}</p>
                        </div>
                        <div>
                          <label htmlFor="nama" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Lengkap</label>
                          <p className="block w-full">{nama}</p>
                        </div>
                        <div>
                          <label htmlFor="tglLahir" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tanggal Lahir</label>
                          <p className="block w-full">{tglLahir}</p>
                        </div>
                        <div>
                          <label htmlFor="jenis" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Jenis</label>
                          <p className="block w-full">{jenis}</p>
                        </div>
                        <div>
                          <label htmlFor="atribut" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Atribut</label>
                          <p className="block w-full">{atribut}</p>
                        </div>
                        <div>
                          <label htmlFor="ipfsAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">IPFS Address</label>
                          <p className="block w-full">{ipfsAddress}</p>
                        </div>
                        <div>
                          <label htmlFor="hashFile" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hash File</label>
                          <p className="block w-full">{hashFile}</p>
                        </div>                       
                        <button onClick={async() =>{ 
                          const hashIdentityResult = await processHashIdentity({ 
                            params: {
                              "_nim": nim,
                              "_nama": nama,
                              "_tglLahir": tglLahir,
                              "_jenis": jenis,
                              "_attributes": atribut,
                            }
                          })
                          const storeDocumentResult = await processStoreDocument({
                            params: {
                              "_identityHash": hashIdentityResult,
                              "_hashFile": "0x"+hashFile,
                              "_ipfsAddress": ipfsAddress
                            }
                          })
                          if(storeDocumentResult) {
                            toast.success("Data berhasil disimpan ke blockchain")
                            updateData({id: id, nim: nim, nama: nama, tglLahir: tglLahir, jenis: jenis, atribut: atribut, ipfsCid: ipfsAddress, fileHash: hashFile, status: true})
                            setShowConfirmation(false)
                          } else {
                            toast.error("Data gagal disimpan ke blockchain!")
                            setShowConfirmation(false)
                          }
                        }} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Simpan</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>            
            </div>
          )
          : null}          
        </div>
        <div>
          {!isGetAllLoading && data && 
          (<div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    NIM
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tanggal Lahir
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Jenis
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Atribut
                  </th>
                  <th scope="col" className="px-6 py-3">
                    IPFS CID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Hash File
                  </th>
                  <th scope="col" className="px-6 py-3">
                    On Blockchain
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((value) => (
                <tr key={value.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">
                    {value.nim}
                  </td>
                  <td className="px-6 py-4">
                    {value.nama}
                  </td>
                  <td className="px-6 py-4">
                    {value.tglLahir}
                  </td>
                  <td className="px-6 py-4">
                    {value.jenis}
                  </td>
                  <td className="px-6 py-4">
                    {value.atribut}
                  </td>
                  <td className="px-6 py-4">
                    <a href={ipfsHttpUrl+value.ipfsCid} target="_blank" className="hover:underline">
                      {value.ipfsCid}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    {value.fileHash}
                  </td>
                  <td className="px-6 py-4">
                    {
                      !value.status && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    }
                    {
                      value.status && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                      )
                    }

                  </td>
                  <td className="flex px-6 py-4">
                    <div className="flex p-2">
                      <button onClick={() => {
                        setButtonName("Edit")
                        setId(value.id)
                        setNim(value.nim)
                        setNama(value.nama)
                        setTglLahir(value.tglLahir)
                        setJenis(value.jenis)
                        setAtribut(value.atribut)
                        setIpfsAddress(value.ipfsCid)
                        setHashFile(value.fileHash)
                        setValueDatePicker(new Date(value.tglLahir))
                        setShowModal(true)
                      }} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-blue-800">Edit</button>

                    </div>
                    <div className="flex p-2">
                      <button onClick={() => {
                        setId(value.id)
                        setNim(value.nim)
                        setNama(value.nama)
                        setTglLahir(value.tglLahir)
                        setJenis(value.jenis)
                        setAtribut(value.atribut)
                        setIpfsAddress(value.ipfsCid)
                        setHashFile(value.fileHash)
                        setShowConfirmation(true)
                      }} className="w-full text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800">                        
                        Send
                      </button>
                    </div>
                  </td>
                </tr>            
                ))
                }
              </tbody>
            </table>
          </div>)}
        </div>
      </DashboardLayout>

    </>
  );
};

export const getServerSideProps: GetServerSideProps<DataProps>  = async () =>{
  const ipfsHttpUrl = process.env.IPFS_HTTP_URL
  const contractAddress: string = process.env.CONTRACT_ADDRESS || ''
  const abi: any = JSON.parse(process.env.ABI || '{}')
  const _props : DataProps = {
    ipfsHttpUrl: ipfsHttpUrl || "",
    contractAddress: contractAddress || "",
    abi: abi || ""
  }
  return { props: _props }
}

export default ListDokumen;
