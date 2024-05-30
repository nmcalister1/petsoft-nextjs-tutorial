"use client"

import { usePetContext } from "@/lib/hooks";
import { Pet } from "@prisma/client"
import Image from "next/image";
import PetButton from "./PetButton";


export default function PetDetails() {
    const { selectedPet } = usePetContext()
  return (
        <section className="flex flex-col w-full h-full">
            {
                !selectedPet ? <EmptyView />
                     : (
                    <>
                        <TopBar selectedPet={selectedPet} />
                        <OtherInfo selectedPet={selectedPet} />
                        <Notes selectedPet={selectedPet} />
                    </>
                )
            }
            
        </section>
    
  )
}

type SelectedPetProps = {
    selectedPet: Pet;
}

function TopBar({ selectedPet }: SelectedPetProps) {
    const { handleCheckoutPet } = usePetContext()
    return (
            <div className="flex items-center bg-white px-8 py-5 border-b border-light">
                <Image src={selectedPet.imageUrl} alt="Selected Pet Image" height={75} width={75} className="h-[75px] w-[75px] rounded-full object-cover"  />
    
                <h2 className="text-3xl font-semibold leading-7 ml-5">{selectedPet.name}</h2>

                <div className="ml-auto space-x-2">
                    <PetButton actionType="edit">Edit</PetButton>
                    <PetButton actionType="checkout" onClick={async () => {
                        await handleCheckoutPet(selectedPet.id)
                    }}>Checkout</PetButton>
                </div>
            </div>
    )
}

function OtherInfo({ selectedPet }: SelectedPetProps) {
    return (
            <div className="flex justify-around py-10 px-5 text-center">
                <div>
                    <h3 className="text-[13px] font-medium uppercase text-zinc-700">Owner name</h3>
                    <p className="mt-1 text-lg text-zinc-800">{selectedPet?.ownerName}</p>
                </div>
    
                <div>
                    <h3 className="text-[13px] font-medium uppercase text-zinc-700">Age</h3>
                    <p className="mt-1 text-lg text-zinc-800">{selectedPet?.age}</p>
                </div>
            </div>
    )
}

function Notes({ selectedPet }: SelectedPetProps) {
    return (
            <section className="bg-white px-7 py-5 rounded-md mb-9 mx-8 flex-1 boder border-light">
                {selectedPet?.notes}
            </section>
    )
}

function EmptyView() {
    return (
        <div className="h-full flex justify-center items-center">
            <p className="text-2xl font-medium">No pet selected</p>
        </div>
    )
}