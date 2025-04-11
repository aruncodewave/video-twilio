'use client'
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

import { useEffect, useState } from "react";
import axios from "axios";
import VideoCallRoom from "@/component/VideoCallRoom";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [identity, setIdentity] = useState("");
  const [room, setRoom] = useState("");

  const fetchToken = async () => {
    try {
    const res = await axios.post('https://81ca-103-181-126-156.ngrok-free.app/video-token', {
      "identity": identity,
      "room": room
    }, {
      headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
      }
    });
    setToken(res.data.token);
    } catch (error) {
    console.error('Error fetching token:', error);
    } finally {
    setLoading(false);
    }
  };
  // useEffect(() => {
   
  //     if(identity && room) {    
  //       fetchToken();
  //     }
   
  // }, [identity,room]);



  return (
    <div className="flex flex-col items-center mt-[50px]">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Identity</label>
        <input
          type="text"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          className="mt-1  text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Room</label>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        
        <button
          onClick={fetchToken}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">submit</button>
      </div>
      { token !==null ? (
        <>  <VideoCallRoom/></>
      ) : (
        ''
      )}
    </div>
  );
}
