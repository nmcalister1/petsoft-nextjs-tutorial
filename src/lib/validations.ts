import { z } from "zod"
import { DEFAULT_PET_IMAGE } from "./constants"

export const petFormSchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name is too long" }),
    ownerName: z.string().trim().min(1, { message: "Owner name is required" }).max(100, { message: "Owner name is too long" }),
    imageUrl: z.string().trim().url({ message: "Invalid URL" }).optional(),
    age: z.coerce.number().int().positive().max(100),
    notes: z.string().trim().max(1000).optional(),
}).transform((data) => ({
    ...data,
    imageUrl: data.imageUrl || DEFAULT_PET_IMAGE,
    notes: data.notes || ""
}))

export type TPetForm = z.infer<typeof petFormSchema>

export const petIdSchema = z.string().cuid()

export const authSchema = z.object({
    email: z.string().email().max(100),
    password: z.string().max(100),
})

export type TAuth = z.infer<typeof authSchema>