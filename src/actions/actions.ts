"use server"

import { signIn, signOut } from "@/lib/auth"
import prisma from "@/lib/db"
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { checkAuth, getPetByPetId } from "@/lib/server-utils"
import { Prisma } from "@prisma/client"
import { AuthError } from "next-auth"

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


// --- user actions ---
export async function logIn(prevState: unknown, formData: unknown) {
    // check if formData is a FormData type
    if (!(formData instanceof FormData)) {
        return {
            message: "Invalid form data."
        
        }
    }

    try {
        await signIn("credentials", formData)
    } catch(error) { 
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin": {
                    return {
                        message: "Invalid credentials."
                    }
                }
                default: {
                    return {
                        message: "Error. Could not sign in."
                    }
                }
            }
        }
        
        throw error // nextjs redirect throws error, so we need to rethrow it
    }
    
}

export async function logOut() {
    await signOut({ redirectTo: "/"})
}

export async function signUp(prevState: unknown, formData: unknown) {
    if (!(formData instanceof FormData)) {
        return {
            message: "Invalid form data."
        
        }
    }
    const formDataEntries = Object.fromEntries(formData.entries())

    const validatedFormData = authSchema.safeParse(formDataEntries)
    if (!validatedFormData.success) {
        return {
            message: "Invalid form data."
        }
    }

    const { email, password } = validatedFormData.data
    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        await prisma.user.create({
            data: {
                email,
                hashedPassword,
            }
        })
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return {
                    message: "Email already exists."
                }
            }
        }

        return {
            message: "Could not create user."
        }
    }

    await signIn("credentials", formData)
}   


// --- pet actions ---
export async function addPet(newPet: unknown) {
    const session = await checkAuth()

    const validatedPet = petFormSchema.safeParse(newPet)
    if (!validatedPet.success) {
        return {
            message: "Invalid pet data."
        }
    }

    try {
        await prisma.pet.create({
            data: {
                ...validatedPet.data,
                user: {
                    connect: {
                        id: session.user.id
                    }
                }
            }
        })
    } catch(error) {
        return {
            message: "Could not add pet."
        }
    }

    revalidatePath("/app", "layout")
}


export async function editPet(petId: unknown, newPetData: unknown) {
    // authentication check
    const session = await checkAuth()

    // validation
    const validatedPet = petFormSchema.safeParse(newPetData)
    if (!validatedPet.success) {
        return {
            message: "Invalid pet data."
        }
    }

    const validatedId = petIdSchema.safeParse(petId)
    if (!validatedId.success) {
        return {
            message: "Invalid pet id."
        }
    }

    // authorization check
    const pet = await getPetByPetId(validatedId.data)
    if (!pet){
        return {
            message: "Pet not found."
        }
    }
    if (pet.userId !== session.user.id) {
        return {
            message: "Unauthorized."
        }
    }


    // database mutation
    try {
        await prisma.pet.update({
            where: {
                id: validatedId.data,
            },
            data: validatedPet.data
        })
    } catch(error) {
        return {
            message: "Could not edit pet."
        }
    }

    
    revalidatePath("/app", "layout")
}


export async function deletePet(petId: unknown) {
    // authentication check
    const session = await checkAuth()

    // validation
    const validatedId = petIdSchema.safeParse(petId)
    if (!validatedId.success) {
        return {
            message: "Invalid pet id."
        }
    }

    // authorization check (user owns pet)
    const pet = await getPetByPetId(validatedId.data)
    if (!pet){
        return {
            message: "Pet not found."
        }
    }
    if (pet.userId !== session.user.id) {
        return {
            message: "Unauthorized."
        }
    }

    // database mutation
    try {
        await prisma.pet.delete({
            where: {
                id: validatedId.data,
            }
        })
    } catch (error) {
        return {
            message: "Could not delete pet."
        }
    }

    revalidatePath("/app", "layout")
}


// --- payment actions ---

export async function createCheckoutSession() {
    const session = await checkAuth()

    const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email,
        line_items: [
            {
                price: "price_1PLkvyEFm86EDqaEFCHsFUiE",
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
        cancel_url: `${process.env.CANONICAL_URL}/payment?canceled=true`,
    })

    redirect(checkoutSession.url)
}

 