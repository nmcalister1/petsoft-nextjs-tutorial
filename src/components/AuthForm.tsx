"use client"

import { logIn, signUp } from "@/actions/actions";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import AuthFormBtn from "./AuthFormBtn";
import { useFormState } from "react-dom";

type AuthFormProps = {
  type: "logIn" | "signUp"
}


export default function AuthForm({ type }: AuthFormProps) {
  const [signUpError, dispatchSignUp] = useFormState(signUp, undefined)
  const [logInError, dispatchLogIn] = useFormState(logIn, undefined)
  return (
    <form action={type === "logIn" ? dispatchLogIn : dispatchSignUp}>
        <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input type="email" name="email" id="email" required maxLength={100} />
        </div>

        <div className="mb-4 mt-2 space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" required maxLength={100} />
        </div>

        <AuthFormBtn type={type} />
        {
          signUpError && <p className="text-red-500 text-sm mt-2">{signUpError.message}</p>
        }
        {
          logInError && <p className="text-red-500 text-sm mt-2">{logInError.message}</p>
        }
    </form>
  )
}
