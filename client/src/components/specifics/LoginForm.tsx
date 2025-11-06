import React from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useAsyncMutation } from '@/hooks/hook'
import { useLoginMutation } from '@/redux/api/api'
import { useDispatch } from 'react-redux'
import { userExists } from '@/redux/reducers/auth'

const LoginForm = () => {
const dispatch = useDispatch();
type LoginInputs = {
  email:string,
  password:string
}

const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>()

  const [isLogin, isLoginLoading] = useAsyncMutation(useLoginMutation);

  const handleLoginSubmit: SubmitHandler<LoginInputs> = async (data) => {
    const res = await isLogin("Checking your details — almost there!",{email:data.email, password:data.password})
    if(res?.data?.data){
         dispatch(userExists(res?.data?.data?.user));
    }
  }

  return (
      <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("email",{required:{value:true,message:"Email is required!"}})}
                      className="bg-background/50"
                    />
                    {errors?.email && <span className='py-4 px-1 text-xs text-red-500'>{errors?.email?.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password",{required:{value:true,message:"Password is required!"}})}
                      className="bg-background/50"
                    />
                    {errors?.password && <span className='py-4 px-1 text-xs text-red-500'>{errors?.password?.message}</span>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-primary border-0 glow-primary"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
  )
}

export default LoginForm