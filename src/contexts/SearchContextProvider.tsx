"use client"

import React, { createContext, useState } from "react"

type SearchContextProviderProps = {
    children: React.ReactNode;
}

type TSearchContext = {
    searchText: string;
    handleChangeSearchText: (newValue: string) => void;
}

export const SearchContext = createContext<TSearchContext | null>(null)

export default function SearchContextProvider({ children }: SearchContextProviderProps) {
    const [searchText, setSearchText] = useState("")

    const handleChangeSearchText = (newValue: string) => {
        setSearchText(newValue)
    }
    
  return (
        <SearchContext.Provider value={{
            searchText,
            handleChangeSearchText,
        }}>{children}</SearchContext.Provider>
    )
}