import { configureStore } from '@reduxjs/toolkit'
import authSlice from './reducers/auth'
import api from './api/api'

export const store = configureStore({
  reducer: {
    [authSlice.name] : authSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  
   middleware: (defaultMiddleware)=>[...defaultMiddleware(),api.middleware]
})