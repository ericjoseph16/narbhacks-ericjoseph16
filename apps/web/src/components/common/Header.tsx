"use client";

import { useUser } from "@clerk/clerk-react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { UserNav } from "./UserNav";

type NavigationItem = {
  name: string;
  href: string;
  current: boolean;
};

const navigation: NavigationItem[] = [
  { name: "Benefits", href: "#Benefits", current: true },
  { name: "Reviews", href: "#reviews", current: false },
];

export default function Header() {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className=" ">
      {({ open }) => (
        <>
          <div className="flex items-center bg-white h-16 sm:h-20">
            <div className="container px-2 sm:px-0">
              <div className="relative flex h-16 items-center justify-between">
                <div className="flex sm:hidden shrink-0 items-center">
                  <Logo isMobile={true} />
                </div>
                <div className="sm:flex hidden shrink-0 items-center">
                  <Logo />
                </div>
                {pathname === "/" && (
                  <div className="flex flex-1 items-center justify-center ">
                    <div className="hidden sm:ml-6 sm:block">
                      <ul className="flex space-x-28">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className="text-[#2D2D2D] text-center text-xl not-italic font-normal leading-[normal]"
                              aria-current={item.current ? "page" : undefined}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {user ? (
                  <div className="hidden sm:flex absolute inset-y-0 right-0 gap-6 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <Link href="/dashboard">
                      <button
                        type="button"
                        className=" text-white text-center text-xl not-italic font-normal leading-[normal] font-montserrat px-[22px] py-[11px] button"
                      >
                        View Drills
                      </button>
                    </Link>
                    <div className="flex items-center gap-2">
                      <UserNav
                        image={user?.imageUrl}
                        name={user?.fullName || "User"}
                        email={user?.primaryEmailAddress?.emailAddress || ""}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="hidden sm:flex absolute inset-y-0 right-0 gap-6 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <Link
                      href="/sign-in"
                      className="border rounded-lg border-solid border-[#2D2D2D] text-[#2D2D2D] text-center text-xl not-italic font-normal leading-[normal] font-montserrat px-[22px] py-2.5"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      className=" text-white text-center text-xl not-italic font-normal leading-[normal] font-montserrat px-[22px] py-[11px] button"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
                <div className="block sm:hidden">
                  {/* Mobile menu button*/}
                  <DisclosureButton className="relative inline-flex  items-center justify-center rounded-md p-2 text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
                <DisclosurePanel className="sm:hidden">
                  <div className="space-y-1 px-2 pb-3 pt-2">
                    {navigation.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className="text-[#2D2D2D] block px-3 py-2 text-base font-medium"
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </div>
                  {user ? (
                    <div className="border-t border-gray-200 pb-3 pt-4">
                      <div className="flex items-center px-4">
                        <div className="flex-shrink-0">
                          <UserNav
                            image={user?.imageUrl}
                            name={user?.fullName || "User"}
                            email={
                              user?.primaryEmailAddress?.emailAddress || ""
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 px-2">
                        <DisclosureButton
                          as={Link}
                          href="/dashboard"
                          className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        >
                          Dashboard
                        </DisclosureButton>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pb-3 pt-4">
                      <div className="space-y-1 px-2">
                        <DisclosureButton
                          as={Link}
                          href="/sign-in"
                          className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        >
                          Sign in
                        </DisclosureButton>
                        <DisclosureButton
                          as={Link}
                          href="/sign-up"
                          className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        >
                          Get Started
                        </DisclosureButton>
                      </div>
                    </div>
                  )}
                </DisclosurePanel>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
