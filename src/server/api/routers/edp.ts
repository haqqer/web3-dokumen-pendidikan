
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const edpRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const listDokumen = await ctx.prisma.edp.findMany({
      orderBy: [
        {
          createdAt: "desc"
        }
      ],
      where: {},
    });
    return listDokumen
  }),
  countAll: publicProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.edp.count();
    return count
  }),
  count: publicProcedure.input(z.object({
    status: z.boolean(),
  })).query(async ({ ctx, input }) => {
    const count = await ctx.prisma.edp.count({
      where: {
        status: input.status
      }
    });
    return count
  }),
  create: publicProcedure.input(z.object({
    nim: z.string().min(12).max(16),
    nama: z.string().min(5).max(30),
    tglLahir: z.string().nonempty(),
    jenis: z.string().nonempty(),
    atribut: z.string().nonempty(),
    ipfsCid: z.string(),
    fileHash: z.string(),
    status: z.boolean(),
  })).mutation(async ({ctx, input}) => {
    const dokumen = await ctx.prisma.edp.create({
      data : {
        nim: input.nim,
        nama: input.nama,
        tglLahir: input.tglLahir,
        jenis: input.jenis,
        atribut: input.atribut,
        ipfsCid: input.ipfsCid,
        fileHash: input.fileHash,
        status: input.status
      }
    })
    return dokumen;
  }),
  update: publicProcedure.input(z.object({
    id: z.string().nonempty(),
    nim: z.string().min(12).max(16),
    nama: z.string().min(5).max(30),
    tglLahir: z.string().nonempty(),
    jenis: z.string().nonempty(),
    atribut: z.string().nonempty(),
    ipfsCid: z.string().nonempty(),
    fileHash: z.string().nonempty(),
    status: z.boolean(),
  })).mutation(async ({ctx, input}) => {
    const dokumen = await ctx.prisma.edp.update({
      where: {
        id: input.id,
      },
      data : {
        nim: input.nim,
        nama: input.nama,
        tglLahir: input.tglLahir,
        jenis: input.jenis,
        atribut: input.atribut,
        ipfsCid: input.ipfsCid,
        fileHash: input.fileHash,
        status: input.status
      }
    })
    return dokumen;
  }),
});
