import {useContext,createContext,useState} from 'react';
export const AuthContext = createContext()
export const AuthContextProvider = ({children}) =>{
    const [userType , setUserType] = useState(null)
    const [allData,setAllData] = useState("")
    return (
        <AuthContext.Provider value={{userType , setUserType , allData,setAllData}} >
            {children}
        </AuthContext.Provider>
    )
}