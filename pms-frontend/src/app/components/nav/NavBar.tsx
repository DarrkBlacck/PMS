import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem, Link, Button
} from "@heroui/react";
import React from 'react';
import Image from 'next/image';
import { FaHandshake } from "react-icons/fa6"; 

const NavBar = () => {
    return (
        <Navbar maxWidth="full" className="fixed shadow-lg bg-secondary shadow-lg">
      <NavbarBrand className="gap-2">
        <FaHandshake size={30} color="white" />
        <p className="font-bold text-white text-3xl text-shadow-md gap-2">PMS</p>
      </NavbarBrand>
      <NavbarContent className="flex gap-4" justify="center">
        <NavbarItem >
          <Link className="text-white" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem >
          <Link className="text-white" href="/about">
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-white" href="/contact">
            Contact us
          </Link>
        </NavbarItem>
      </NavbarContent>
      </Navbar>
    );
};

export default NavBar;

