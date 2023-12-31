import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import {  useState } from "react";
import { useRouter } from 'next/router'
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import Datepicker from "tailwind-datepicker-react";


type DataProps = {
  rpcUrl: string
  contractAddress: string
  abi: any
}
const Validasi: NextPage<DataProps> = ({ abi, contractAddress, rpcUrl }) => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contractInstance = new ethers.Contract(
    contractAddress,
    abi,
    provider
  );

  const [nim, setNim] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [tgLahir, setTglLahir] = useState<string>("");
  const [jenis, setJenis] = useState<string>("");
  const [atribut, setAtribut] = useState<any>({});

  // file upload
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const router = useRouter()


  const [showDatePicker, setShowDatePicker] = useState<boolean>()
	const handleClose = (state: boolean) => {
		setShowDatePicker(state)
	}

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
  const processValidate = async (hashFile: string): Promise<Boolean> => {
    let hashdentity = await contractInstance.HashIdentity(
      nim,
      nama,
      tgLahir,
      jenis,
      atribut,
    );
    console.log(hashdentity)
    let verifyIdentity: Boolean = await contractInstance.VerifyIdentity(hashdentity);
    if (!verifyIdentity) {
      return false
    }
    let verifyDocument: Boolean = await contractInstance.VerifyDocument(hashdentity, hashFile);
    return verifyDocument
  }

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("file", selectedFile);
      const data = await fetch("/api/upload", {
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
      <Head>
        <title>Web3 Dokumen Pendidikan</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Web3 <span className="text-[hsl(280,100%,70%)]">-</span> Dokumen Pendidikan
          </h1>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-8">
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
              {/* <input value={tgLahir} onChange={(e) => setTglLahir(e.target.value)} type="text" name="tglLahir" id="tglLahir" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Tanggal Lahir" required /> */}
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
              onChange={async ({ target }) => {
                if (target.files) { 
                  const file = target.files[0];
                  setSelectedFile(file);
                }
              }}
              type="file" name="file" id="file" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Atribut" required />
            </div>
            <div className="col-span-2">
              <button
                className="p-3 text-lg block w-full rounded-xl bg-yellow-500 text-center"
                onClick={async () => {
                  const uploadResult = await handleUpload()
                  const hashFile = "0x"+uploadResult.hash
                  console.log(hashFile)
                  const result = await processValidate(hashFile)
                  if (result) {
                    toast.success("Data Valid")
                  } else {
                    toast.error("Data Tidak Valid")
                  }
                }}
              >
                Validasi
              </button>
            </div>     
          </div>
        </div>
      </main>
  </>
  );
};

export const getServerSideProps: GetServerSideProps<DataProps>  = async () =>{
  const rpcUrl: string = process.env.SEPOLIA_URL || ''
  const contractAddress: string = process.env.CONTRACT_ADDRESS || ''
  const abi: any = JSON.parse(process.env.ABI || '{}')

  const _props: DataProps = {
    rpcUrl: rpcUrl,
    abi: abi,
    contractAddress: contractAddress
  } 
  return { props: _props}
}

export default Validasi;
