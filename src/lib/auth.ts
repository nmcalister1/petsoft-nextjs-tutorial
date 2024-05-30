import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import { getUserByEmail } from "./server-utils";
import { authSchema } from "./validations";

const config = {
    pages: {
        signIn: "/login",
    },
    session: {
        maxAge: 30 * 24 * 60 * 60,
        strategy: "jwt",
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                // validation
                const validatedFormData = authSchema.safeParse(credentials)
                if (!validatedFormData.success) {
                    return null
                }

                // runs on login
                const { email, password } = validatedFormData.data

                const user = await getUserByEmail(email)

                if (!user) {
                    return null
                }

                const passwordsMatch = await bcrypt.compare(password, user.hashedPassword)

                if (!passwordsMatch) {
                    return null
                }

                return user
            }
        })
    ],
    callbacks: {
        authorized: ({ auth, request }) => {
            // runs on every request with middleware
            const isLoggedIn = Boolean(auth?.user)
            const accessingApp = request.nextUrl.pathname.includes("/app")

            if (!isLoggedIn && accessingApp) {
                return false
            }

            if (isLoggedIn && accessingApp && !auth?.user.hasAccess) {
                return Response.redirect(new URL("/payment", request.nextUrl))
            }

            if (isLoggedIn && accessingApp && auth?.user.hasAccess) {
                return true
            }

            if (isLoggedIn && !accessingApp) {
                if ((request.nextUrl.pathname.includes("/login") || request.nextUrl.pathname.includes("/signup")) && !(auth?.user.hasAccess)) {
                    return Response.redirect(new URL("/payment", request.nextUrl))
                }
                return true
            }

            if (!isLoggedIn && !accessingApp) {
                return true
            }

            return false

        },
        jwt: ({ token, user }) => {
            if (user) {
                token.userId = user.id
                token.hasAccess = user.hasAccess
            }

            return token
        },
        session: ({ session, token }) => {
            if (session.user) {
                session.user.id = token.userId
                session.user.hasAccess = token.hasAccess
            }
            return session
        }
    },
} satisfies NextAuthConfig

export const {auth, signIn, signOut, handlers: {GET, POST}} = NextAuth(config)

