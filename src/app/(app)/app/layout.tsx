import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";
import BackgroundPattern from "@/components/BackgroundPattern";
import { Toaster } from "@/components/ui/sonner";
import PetContextProvider from "@/contexts/PetContextProvider";
import SearchContextProvider from "@/contexts/SearchContextProvider";
import { checkAuth, getPetsByUserId } from "@/lib/server-utils";


export default async function Layout({ children }: Readonly<{
    children: React.ReactNode;
  }>) {

    const session = await checkAuth()
    const pets = await getPetsByUserId(session.user.id)

  return (
    <>
        <BackgroundPattern />
        
        <div className="flex flex-col max-w-[1050px] mx-auto px-4 min-h-screen">
            <AppHeader />
              <SearchContextProvider>
                <PetContextProvider data={pets}>
                  {children}
                </PetContextProvider>
              </SearchContextProvider>
            <AppFooter />
        </div>

        <Toaster position="top-right" />
        
    </>
  )
}
