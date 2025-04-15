"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input,Button,Form } from "@heroui/react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useSearchParams } from "next/navigation";

export default function Login() {
  const searchParams = useSearchParams();
  const toastMessage = searchParams.get('toast');

  useEffect(() => {
    if (toastMessage) {
      toast.error(toastMessage);
    }
  }, [toastMessage]);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false); // To handle loading state
  const [visible, setVisible] = useState(false);
  const router = useRouter();



  const togglevisibility = () => {
    setVisible(!visible);
  };

  

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try{
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({email, password}),
      });
      
      console.log("Response status:", response.status);
      
      // Try to get the response text first
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      if(!response.ok){
        const data = JSON.parse(responseText);
        setError(data.message);
        console.error('Failed login:', data.message)
      }
      else{
        const data = JSON.parse(responseText);
      if(data.status==="Inactive"){
        toast.error("Your account is inactive. Please contact the admin.");
        return;
      }
      toast.success("Login successful");
      console.log(`yep. ${data.access_token}`);
      Cookies.set('access_token', data.access_token, {
        expires: 0.5,
        path:"/",
        secure: true,
        sameSite: 'Strict'      
      });

      if (data.role==="faculty") {
        router.push(`/faculty/profile`);
    }
    else if (data.role==="student") {

        router.push(`/students/profile`);
    }
    else if (data.role==="admin") {
        router.push(`/admin/profile`);
    }
    else if (data.role==="alumni") {
        router.push(`/alumni/profile`);
    }
    else {
        setError("Invalid role.");
    }
  }
  }
  catch (err){

    if ( err instanceof Error ){
      toast.error(`Failed to login: ${err.message}`);
      console.log(err.message);
    } else {
      toast.error(`Failed to login console`);
      console.log("Unknown error",err);
    }
  }
   };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Welcome to PMS</h1>

        {loading && <p className="text-blue-500 text-sm mb-2">Loading users...</p>}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <Form onSubmit={handleLogin}>
        <Input
          type="email"
          isClearable
          placeholder="Email"
          variant="underlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full mb-2 text-black"
        />
        <Input
          type={visible ? "text": "password"}
          isClearable
          variant="underlined"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full mb-4 text-black"
          endContent={
            <Button
            isIconOnly
              variant="light"
              onPress={togglevisibility}
              className="data-[hover=true]:bg-[initial] text-gray-500"
            >
              {visible ? <IoMdEyeOff /> : <IoMdEye />}
            </Button>
          }
        />
        <Button
          type="submit"
          color="secondary"
          className="px-4 py-2 rounded w-full hover:bg-primary disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Loading..." : "Enter PMS"}
        </Button>
        </Form>
      </div>
    </div>
  );
}

