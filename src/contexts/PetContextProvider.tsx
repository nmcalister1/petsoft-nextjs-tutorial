"use client"

import { addPet, deletePet, editPet } from "@/actions/actions";
import { PetEssentials } from "@/lib/types";
import { Pet } from "@prisma/client"
import React, { createContext, useOptimistic, useState } from "react"
import { toast } from "sonner";

type PetContextProviderProps = {
    data: Pet[];
    children: React.ReactNode;
}

type TPetContext = {
    pets: Pet[];
    selectedPetId: Pet["id"] | null;
    handleChangeSelectedPetId: (id: Pet["id"]) => void;
    selectedPet: Pet | undefined;
    numberOfPets: number;
    handleAddPet: (newPet: PetEssentials) => Promise<void>;
    handleEditPet: (petId: Pet["id"], newPetData: PetEssentials) => Promise<void>;
    handleCheckoutPet: (petId: Pet["id"]) => Promise<void>;
}

export const PetContext = createContext<TPetContext | null>(null)

export default function PetContextProvider({ data, children }: PetContextProviderProps) {

    const [ optimisticPets, setOptimisticPets ] = useOptimistic(data, (state, {action, payload}) => {
        switch (action) {
            case "add":
                return [...state, { ...payload, id: Math.random().toString() }]
            case "edit":
                return state.map(pet => pet.id === payload.id ? { ...pet, ...payload.newPetData } : pet)
            case "delete":
                return state.filter(pet => pet.id !== payload.id)
            default:
                return state
        }
    })
    
    const [ selectedPetId, setSelectedPetId ] = useState<string | null>(null)

    const selectedPet = optimisticPets.find(pet => pet.id === selectedPetId)
    const numberOfPets = optimisticPets.length

    const handleAddPet = async (newPet: PetEssentials) => {
        setOptimisticPets({ action: "add", payload: newPet})
        const error = await addPet(newPet)
        if (error) {
            toast.warning(error.message)
            return
        }
    }

    const handleEditPet = async (petId: Pet["id"], newPetData: PetEssentials) => {
        setOptimisticPets({ action: "edit", payload: { id: petId, newPetData }})
        const error = await editPet(petId, newPetData)
        if (error) {
            toast.warning(error.message)
            return
        }
    }

    const handleCheckoutPet = async (petId: Pet["id"]) => {
        setOptimisticPets({ action: "delete", payload: { id: petId }})
        const error = await deletePet(petId)
        if (error) {
            toast.warning(error.message)
            return
        }
        setSelectedPetId(null)
    }

    const handleChangeSelectedPetId = (id: Pet["id"]) => {
        setSelectedPetId(id)
    }
  return (
        <PetContext.Provider value={{
        pets: optimisticPets,
        selectedPetId,
        handleChangeSelectedPetId,
        selectedPet,
        numberOfPets,
        handleAddPet,
        handleEditPet,
        handleCheckoutPet,
    }}>{children}</PetContext.Provider>
    )
}
