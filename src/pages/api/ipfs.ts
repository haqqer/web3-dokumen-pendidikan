import { NextApiRequest, NextApiResponse } from "next";
import { create } from 'kubo-rpc-client'
import formidable from "formidable";
import path from "path";
import { createHash } from "crypto";
import fs from "fs";

export const config = {
  api: {
      bodyParser: false    // disable built-in body parser
  }
}

const handleUpload = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const options: formidable.Options = {};
    options.uploadDir = path.join(process.cwd(), "/public/files");
    options.filename = (name, ext, path, form) => {
      return path.originalFilename || "";
    };
    const form = formidable(options);

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            reject("Something went wrong");
            return;
        }
        resolve({ fields, files });
    })
  })
}

const uploadFile = async (req: NextApiRequest, res: NextApiResponse) => {
  const ipfsNode = await create({ url: process.env.IPFS_RPC_URL })
  const result = await handleUpload(req)
  const filePath = result.files?.file?.filepath
  const file = fs.readFileSync(filePath);
  const ipfsUpload = await ipfsNode.add({ content: file })
  const hash = createHash("md5").update(file).digest("hex");
  res.status(200).json({ cid: ipfsUpload.cid.toString(), hash: hash })  
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    req.method === "POST"
    ? uploadFile(req, res)
    : req.method === "PUT"
    ? console.log("PUT")
    : req.method === "DELETE"
    ? console.log("DELETE")
    : req.method === "GET"
    ? res.status(404).send("")
    : res.status(404).send("");
  }
