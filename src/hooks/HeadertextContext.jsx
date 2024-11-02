import React,{useContext,createContext,useState} from 'react'

const UserContextProvider = createContext()

const UserContext = ({children}) => {
    const [headerText,setHeaderText] = useState("")
  return (
    <UserContextProvider.Provider value={{headerText,setHeaderText}}>
    {children}
    </UserContextProvider.Provider>
  )
}

export const useUserContext = ()=> useContext(UserContextProvider )

export default UserContext

