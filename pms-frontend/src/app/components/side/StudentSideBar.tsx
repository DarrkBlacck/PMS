
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link
} from "@heroui/react";
import React, { useState } from "react";
import {  IoDocuments } from "react-icons/io5";
import { CgProfile, CgPerformance } from "react-icons/cg";
import { IoMdListBox } from "react-icons/io";
import { PiStudentFill, PiChalkboardTeacherFill } from "react-icons/pi";
import { GrSchedulePlay } from "react-icons/gr";
import { RiUserCommunityFill } from "react-icons/ri";



const StudentSidebar = () => {
  
  return (
    <Navbar className="top-16 shadow-lg bg-secondary h-screen w-48 flex flex-col fixed left-0 z-10 justify-start pt-4">
      <NavbarContent className="items-start flex flex-col gap-4 w-full">
        <NavbarItem className="w-full">
          <Link href="/students/profile">
                      <div className="flex text-white items-center text-lg gap-2 hover:text-black">
            <CgProfile />Profile
            </div>
          </Link>
        </NavbarItem>
        <NavbarItem className="w-full">
          <Link href="/students/notice">
                      <div className="flex items-center text-white text-lg hover:text-black gap-2">
            <IoMdListBox />Notice
            </div>
          </Link>
        </NavbarItem>
        
        {/* Users section with nested items
        <div className="w-full flex flex-col">
          <Link href="/students/users">
            <div className="flex items-center gap-2 text-white text-lg hover:text-black">
              <FaUsers /> Users
            </div>
          </Link>
          
          <div className="pl-6 mt-2 flex flex-col gap-2">
            <Link href="/users/students">
                          <div className="flex items-center gap-2 text-white text-m hover:text-black">
                          <PiStudentFill />Students
                          </div>
            </Link>
            <Link href="/users/faculties">
                          <div className="flex items-center gap-2 text-white text-m hover:text-black">
              <PiChalkboardTeacherFill />Faculties
              </div>
            </Link>
          </div>
        </div> */}
        
        <NavbarItem className="w-full">
          <Link href="/students/drives">
                        <div className="flex items-center gap-2 text-white text-lg hover:text-black">
            <GrSchedulePlay />Drives
            </div>
          </Link>
        </NavbarItem>

        <NavbarItem className="w-full">
          <Link href="/students/resumes">
                        <div className="flex items-center gap-2 text-white text-lg hover:text-black">
            <IoDocuments />Resumes
            </div>
          </Link>
        </NavbarItem>

        <NavbarItem className="w-full">
          <Link href="/students/community">
                        <div className="flex items-center gap-2 text-white text-lg hover:text-black">
            <RiUserCommunityFill />Community
            </div>
          </Link>
        </NavbarItem>
        <NavbarItem className="w-full">
          <Link href="/students/performance">
                        <div className="flex items-center gap-2 text-white text-lg hover:text-black">
            <CgPerformance />Performance
            </div>
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default StudentSidebar;
