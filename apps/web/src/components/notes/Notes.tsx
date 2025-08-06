"use client";

import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import CreateNote from "./CreateNote";
import NoteItem from "./NoteItem";

const Notes = () => {
  const [search, setSearch] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const allNotes = useQuery(api.notes.getNotes);
  const deleteNote = useMutation(api.notes.deleteNote);

  // Don't render anything until we're on the client
  if (!isClient) {
    return (
      <div className="container pb-10">
        <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4  sm:mb-10">
          Your Skill Drills
        </h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const finalNotes = search
    ? allNotes?.filter(
        (note: any) =>
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.content.toLowerCase().includes(search.toLowerCase())
      )
    : allNotes;

  // If notes are still loading or not available, show loading state
  if (allNotes === undefined) {
    return (
      <div className="container pb-10">
        <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4  sm:mb-10">
          Your Skill Drills
        </h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-10">
      <h1 className="text-[#2D2D2D] text-center text-[20px] sm:text-[43px] not-italic font-normal sm:font-medium leading-[114.3%] tracking-[-1.075px] sm:mt-8 my-4  sm:mb-10">
        Your Skill Drills
      </h1>
      <div className="px-5 sm:px-0">
        <div className="bg-white flex items-center h-[39px] sm:h-[55px] rounded-sm border border-solid gap-2 sm:gap-5 mb-10 border-[rgba(0,0,0,0.40)] px-3 sm:px-11">
          <Image
            src={"/images/search.svg"}
            width={23}
            height={22}
            alt="search"
            className="cursor-pointer sm:w-[23px] sm:h-[22px] w-[20px] h-[20px]"
          />
          <input
            type="text"
            placeholder="Search drills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-[#2D2D2D] text-[17px] sm:text-2xl not-italic font-light leading-[114.3%] tracking-[-0.6px] focus:outline-0 focus:ring-0 focus:border-0 border-0"
          />
        </div>
      </div>

      <div className="border-[0.5px] mb-20 divide-y-[0.5px] divide-[#00000096] border-[#00000096]">
        {finalNotes?.map((note: any) => (
          <NoteItem key={note._id} note={note} deleteNote={deleteNote} />
        ))}
      </div>

      <CreateNote />
    </div>
  );
};

export default Notes;
