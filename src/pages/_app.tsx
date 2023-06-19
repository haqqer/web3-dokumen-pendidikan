import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { MoralisProvider } from "react-moralis";
import { Toaster } from "react-hot-toast";
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <MoralisProvider initializeOnMount={false}>
      <Toaster position="top-center" gutter={100}/>
      <Component {...pageProps} />;
    </MoralisProvider>
  )
};

export default api.withTRPC(MyApp);
