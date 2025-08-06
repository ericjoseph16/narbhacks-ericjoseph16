"use client";

import Header from "@/components/common/Header";
import dynamic from "next/dynamic";

const Notes = dynamic(() => import("@/components/notes/Notes"), {
  ssr: false,
  loading: () => (
    <div className="container pb-10">
      <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4  sm:mb-10">
        Your Skill Drills
      </h1>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="bg-[#EDEDED] h-screen">
      <Header />
      <Notes />
    </main>
  );
}
