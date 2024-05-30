"use client"

import { createCheckoutSession } from "@/actions/actions";
import H1 from "@/components/H1";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export default function Page({ searchParams }: {
  searchParams: {[key: string]: string | string[] | undefined}
}) {
  const [isPending, startTransition] = useTransition()
  const { update } = useSession()

  return (
    <main className="flex flex-col items-center space-y-10">
        <H1>Petsoft access required payment</H1>

        {
          !searchParams.success && (
            <Button disabled={isPending} onClick={async () => {
                startTransition(async () => {
                    await createCheckoutSession()
                })
            }}>Buy lifetime access for $299</Button>
          )
        }

        {
          searchParams.success && (
            <p className="text-sm text-green-700">Payment successful! You now have lifetime access to Petsoft.</p>
          )
        }
        {
          searchParams.canceled && (
            <p className="text-sm text-red-700">Payment canceled. You can try again.</p>
          )
        }

    </main>
  )
}
