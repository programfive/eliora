import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{display:'flex' , justifyContent:'center', alignContent:'center'}}>
      <SignUp />
    </div>
  )
}