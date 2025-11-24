import { useState } from "react";

// Headless UI 2.x for React, for more info and examples you can check out https://github.com/tailwindlabs/headlessui
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";

export default function LayoutsVariousLightContent() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  return (
    <>
      {/* Page Container */}
      <div
        id="page-container"
        className={`mx-auto flex min-h-dvh w-full min-w-80 flex-col bg-white dark:bg-gray-900 dark:text-gray-100 ${
          desktopSidebarOpen ? "lg:pl-64" : ""
        }`}
      >
        {/* Page overlay when mobile sidebar is open */}
        <Transition
          appear
          show={mobileSidebarOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-gray-200/50 p-4 backdrop-blur-xs lg:hidden lg:p-8 dark:bg-gray-800/40"
            aria-hidden={!mobileSidebarOpen}
            tabIndex={-1}
          />
        </Transition>
        {/* END Page overlay when mobile sidebar is open */}

        {/* Page Sidebar */}
        <aside
          id="page-sidebar"
          className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-out lg:shadow-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 ${
            desktopSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
          } ${mobileSidebarOpen ? "translate-x-0 shadow-lg shadow-gray-200 dark:shadow-gray-950/50" : "-translate-x-full"}`}
          aria-label="Main Sidebar Navigation"
        >
          {/* Sidebar Header */}
          <div className="flex h-16 flex-none items-center justify-between border-b border-gray-100 px-4 dark:border-gray-800/75">
            {/* Brand */}
            <a
              href="#"
              className="group inline-flex items-center gap-2 px-2.5 font-bold tracking-wide text-gray-900 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 73 49"
                className="size-6"
              >
                <path
                  fill="#38bdf8"
                  d="M46.868 24c0 12.426-10.074 22.5-22.5 22.5-12.427 0-22.5-10.074-22.5-22.5S11.94 1.5 24.368 1.5c12.426 0 22.5 10.074 22.5 22.5Z"
                />
                <path
                  fill="#a855f7"
                  d="M71.132 24c0 12.426-9.975 22.5-22.28 22.5-12.304 0-22.278-10.074-22.278-22.5S36.547 1.5 48.852 1.5c12.304 0 22.28 10.074 22.28 22.5Z"
                />
                <path
                  fill="#6b21a8"
                  d="M36.67 42.842C42.81 38.824 46.868 31.886 46.868 24c0-7.886-4.057-14.824-10.198-18.841A22.537 22.537 0 0 0 26.573 24 22.537 22.537 0 0 0 36.67 42.842Z"
                />
              </svg>
              <span>Circles AI</span>
            </a>
            {/* END Brand */}

            {/* Close Sidebar on Mobile */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                type="button"
                className="group relative inline-flex w-full items-center gap-2 rounded-lg p-2 text-sm leading-5 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                <span className="absolute inset-0 scale-50 rounded-lg bg-gray-100 opacity-0 transition ease-out group-hover:scale-100 group-hover:opacity-100 group-active:scale-105 group-active:bg-gray-200 dark:bg-gray-700/50 dark:group-active:bg-gray-700/75" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="rehi-micro hi-x-mark relative inline-block size-4"
                >
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            </div>
            {/* END Close Sidebar on Mobile */}
          </div>
          {/* END Sidebar Header */}

          {/* Sidebar Content */}
          <div className="grow overflow-y-auto">
            <div className="flex flex-col gap-4 px-4 py-6">
              {/* Search */}
              <form onSubmit={(e) => e.preventDefault()} className="mx-2.5">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 my-px ml-px flex w-10 items-center justify-center rounded-l-lg text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="hi-micro hi-magnifying-glass inline-block size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    className="block w-full rounded-lg border border-gray-100 bg-gray-50 py-1.5 pr-3 pl-9 text-sm leading-6 placeholder-gray-500 focus:border-gray-300 focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:placeholder-gray-400 dark:focus:border-gray-600/50 dark:focus:ring-gray-800"
                    placeholder="Search.."
                  />
                </div>
              </form>
              {/* END Search */}

              {/* Navigation */}
              <nav className="flex flex-col gap-0.5">
                <h4 className="mx-2.5 pb-2 text-sm font-semibold text-black dark:text-white">
                  Overview
                </h4>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-blue-700 hover:bg-gray-100/60 dark:text-blue-400 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-home inline-block size-4 flex-none text-blue-600 dark:text-blue-400"
                  >
                    <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
                  </svg>
                  <span className="grow py-1.5">Dashboard</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-briefcase inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11 4V3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1ZM9 2.5H7a.5.5 0 0 0-.5.5v1h3V3a.5.5 0 0 0-.5-.5ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                      clipRule="evenodd"
                    />
                    <path d="M3 11.83V12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-.17c-.313.11-.65.17-1 .17H4c-.35 0-.687-.06-1-.17Z" />
                  </svg>
                  <span className="grow py-1.5">Projects</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-chart-bar inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path d="M12 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1ZM6.5 6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6ZM2 9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9Z" />
                  </svg>
                  <span className="grow py-1.5">Sales</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-document-text inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 5.75A.75.75 0 0 1 5.75 7h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 7.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="grow py-1.5">Invoices</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-users inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path d="M8.5 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10.9 12.006c.11.542-.348.994-.9.994H2c-.553 0-1.01-.452-.902-.994a5.002 5.002 0 0 1 9.803 0ZM14.002 12h-1.59a2.556 2.556 0 0 0-.04-.29 6.476 6.476 0 0 0-1.167-2.603 3.002 3.002 0 0 1 3.633 1.911c.18.522-.283.982-.836.982ZM12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  </svg>
                  <span className="grow py-1.5">Customers</span>
                </a>
                <h4 className="mx-2.5 pt-6 pb-2 text-sm font-semibold text-black dark:text-white">
                  Account
                </h4>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-user-circle inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 9c-1.825 0-3.422.977-4.295 2.437A5.49 5.49 0 0 0 8 13.5a5.49 5.49 0 0 0 4.294-2.063A4.997 4.997 0 0 0 8 9Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="grow py-1.5">Profile</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-shield-check inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.5 1.709a.75.75 0 0 0-1 0 8.963 8.963 0 0 1-4.84 2.217.75.75 0 0 0-.654.72 10.499 10.499 0 0 0 5.647 9.672.75.75 0 0 0 .694-.001 10.499 10.499 0 0 0 5.647-9.672.75.75 0 0 0-.654-.719A8.963 8.963 0 0 1 8.5 1.71Zm2.34 5.504a.75.75 0 0 0-1.18-.926L7.394 9.17l-1.156-.99a.75.75 0 1 0-.976 1.138l1.75 1.5a.75.75 0 0 0 1.078-.106l2.75-3.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="grow py-1.5">License</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-cog-8-tooth inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-1.081a.5.5 0 0 1 .67.033l.774.775a.5.5 0 0 1 .034.67l-1.08 1.32c.25.417.44.873.561 1.357l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l1.082 1.322a.5.5 0 0 1-.034.67l-.774.774a.5.5 0 0 1-.67.033l-1.322-1.08c-.416.25-.872.44-1.356.561l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562L4.108 13.37a.5.5 0 0 1-.67-.033l-.774-.775a.5.5 0 0 1-.034-.67l1.08-1.32a4.971 4.971 0 0 1-.561-1.357l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356L2.629 4.107a.5.5 0 0 1 .034-.67l.774-.774a.5.5 0 0 1 .67-.033L5.43 3.71a4.97 4.97 0 0 1 1.356-.561l.17-1.699ZM6 8c0 .538.212 1.026.558 1.385l.057.057a2 2 0 0 0 2.828-2.828l-.058-.056A2 2 0 0 0 6 8Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="grow py-1.5">Settings</span>
                </a>
                <h4 className="mx-2.5 pt-6 pb-2 text-sm font-semibold text-black dark:text-white">
                  Support
                </h4>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-question-mark-circle inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="grow py-1.5">FAQ</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-lifebuoy inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.95 3.05a7 7 0 1 0-9.9 9.9 7 7 0 0 0 9.9-9.9Zm-7.262-.042a5.516 5.516 0 0 1 4.624 0L8.698 5.082a3.016 3.016 0 0 0-1.396 0L5.688 3.008Zm-2.68 2.68a5.516 5.516 0 0 0 0 4.624l2.074-1.614a3.015 3.015 0 0 1 0-1.396L3.008 5.688Zm2.68 7.304 1.614-2.074c.458.11.938.11 1.396 0l1.614 2.074a5.516 5.516 0 0 1-4.624 0Zm7.304-2.68a5.516 5.516 0 0 0 0-4.624l-2.074 1.614c.11.458.11.938 0 1.396l2.074 1.614ZM6.94 6.939a1.5 1.5 0 1 1 2.122 2.122 1.5 1.5 0 0 1-2.122-2.122Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="grow py-1.5">Help</span>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium hover:bg-gray-100/60 dark:hover:bg-gray-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="hi-micro hi-book-open inline-block size-4 flex-none text-gray-400 group-hover:text-gray-950 dark:group-hover:text-gray-50"
                  >
                    <path d="M7.25 3.688a8.035 8.035 0 0 0-4.872-.523A.48.48 0 0 0 2 3.64v7.994c0 .345.342.588.679.512a6.02 6.02 0 0 1 4.571.81V3.688ZM8.75 12.956a6.02 6.02 0 0 1 4.571-.81c.337.075.679-.167.679-.512V3.64a.48.48 0 0 0-.378-.475 8.034 8.034 0 0 0-4.872.523v9.268Z" />
                  </svg>
                  <span className="grow py-1.5">Documentation</span>
                </a>
              </nav>
              {/* END Navigation */}
            </div>
          </div>
          {/* END Sidebar Content */}

          {/* Sidebar Footer */}
          <div className="flex flex-none items-center border-t border-gray-100 p-4 dark:border-gray-800/75">
            {/* User Dropdown */}
            <Menu as="div" className="relative w-full">
              {/* Dropdown Toggle Button */}
              <MenuButton className="group relative inline-flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm leading-5 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                <span className="absolute inset-0 scale-50 rounded-lg bg-gray-100 opacity-0 transition ease-out group-hover:scale-100 group-hover:opacity-100 group-active:scale-105 group-active:bg-gray-200 dark:bg-gray-700/50 dark:group-active:bg-gray-700/75" />
                <span className="relative inline-flex items-center gap-2">
                  <span className="relative inline-block flex-none">
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 size-3 rounded-full border-2 border-white bg-emerald-500" />
                    <img
                      src="https://cdn.tailkit.com/media/placeholders/avatar-bY4GXQKfZrA-160x160.jpg"
                      alt="User Avatar"
                      className="inline-block size-8 rounded-lg"
                    />
                  </span>
                  <span className="flex grow flex-col text-left">
                    <span className="w-40 truncate text-sm font-semibold">
                      Emma Doe
                    </span>
                    <span className="w-40 truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                      @emma.doe
                    </span>
                  </span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="hi-micro hi-ellipsis-horizontal relative inline-block size-4 flex-none opacity-50"
                >
                  <path d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                </svg>
              </MenuButton>
              {/* END Dropdown Toggle Button */}

              {/* Dropdown */}
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-4"
              >
                <MenuItems
                  modal={false}
                  className="absolute right-0 bottom-full left-0 z-10 mb-1 origin-bottom rounded-lg shadow-xl shadow-gray-500/10 focus:outline-hidden dark:shadow-gray-900"
                >
                  <div className="divide-y divide-gray-100 rounded-lg bg-white ring-1 ring-black/5 dark:divide-gray-700 dark:bg-gray-800 dark:ring-gray-700">
                    <div className="space-y-1 p-2.5">
                      <MenuItem>
                        {({ focus }) => (
                          <a
                            href="#"
                            className={`group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium ${
                              focus
                                ? "bg-gray-100/60 dark:bg-gray-700/50"
                                : ""
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className={`hi-micro hi-inbox inline-block size-4 flex-none ${
                                focus
                                  ? "text-gray-950 dark:text-gray-50"
                                  : "text-gray-400"
                              }`}
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.784 3A2.25 2.25 0 0 0 2.68 4.449L1.147 8.475A2.25 2.25 0 0 0 1 9.276v1.474A2.25 2.25 0 0 0 3.25 13h9.5A2.25 2.25 0 0 0 15 10.75V9.276c0-.274-.05-.545-.147-.801l-1.534-4.026A2.25 2.25 0 0 0 11.216 3H4.784Zm-.701 1.983a.75.75 0 0 1 .7-.483h6.433a.75.75 0 0 1 .701.483L13.447 9h-2.412a1 1 0 0 0-.832.445l-.406.61a1 1 0 0 1-.832.445h-1.93a1 1 0 0 1-.832-.445l-.406-.61A1 1 0 0 0 4.965 9H2.553l1.53-4.017Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="grow py-1.5">Inbox</span>
                          </a>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ focus }) => (
                          <a
                            href="#"
                            className={`group flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium ${
                              focus
                                ? "bg-gray-100/60 dark:bg-gray-700/50"
                                : ""
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className={`hi-micro hi-cursor-arrow-rays inline-block size-4 flex-none ${
                                focus
                                  ? "text-gray-950 dark:text-gray-50"
                                  : "text-gray-400"
                              }`}
                            >
                              <path d="M7.25 1.75a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-1.5 0v-1.5ZM11.536 2.904a.75.75 0 1 1 1.06 1.06l-1.06 1.061a.75.75 0 0 1-1.061-1.06l1.06-1.061ZM14.5 7.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75ZM4.464 9.975a.75.75 0 0 1 1.061 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061ZM4.5 7.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75ZM5.525 3.964a.75.75 0 0 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 1.06-1.061l1.061 1.06ZM8.779 7.438a.75.75 0 0 0-1.368.366l-.396 5.283a.75.75 0 0 0 1.212.646l.602-.474.288 1.074a.75.75 0 1 0 1.449-.388l-.288-1.075.759.11a.75.75 0 0 0 .726-1.165L8.78 7.438Z" />
                            </svg>
                            <span className="grow py-1.5">Payments</span>
                          </a>
                        )}
                      </MenuItem>
                    </div>
                    <div className="space-y-1 p-2.5">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              type="submit"
                              className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium ${
                                focus
                                  ? "bg-gray-100/60 dark:bg-gray-700/50"
                                  : ""
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className={`hi-micro hi-arrow-left-start-on-rectangle inline-block size-4 flex-none ${
                                  focus
                                    ? "text-gray-950 dark:text-gray-50"
                                    : "text-gray-400"
                                }`}
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14 4.75A2.75 2.75 0 0 0 11.25 2h-3A2.75 2.75 0 0 0 5.5 4.75v.5a.75.75 0 0 0 1.5 0v-.5c0-.69.56-1.25 1.25-1.25h3c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25h-3c-.69 0-1.25-.56-1.25-1.25v-.5a.75.75 0 0 0-1.5 0v.5A2.75 2.75 0 0 0 8.25 14h3A2.75 2.75 0 0 0 14 11.25v-6.5Zm-9.47.47a.75.75 0 0 0-1.06 0L1.22 7.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06l-.97-.97h7.19a.75.75 0 0 0 0-1.5H3.56l.97-.97a.75.75 0 0 0 0-1.06Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="grow py-1.5">Sign out</span>
                            </button>
                          )}
                        </MenuItem>
                      </form>
                    </div>
                  </div>
                </MenuItems>
              </Transition>
              {/* END Dropdown */}
            </Menu>
            {/* END User Dropdown */}
          </div>
          {/* END Sidebar Footer */}
        </aside>
        {/* Page Sidebar */}

        {/* Page Header */}
        <header
          id="page-header"
          className="fixed top-0 right-0 left-0 z-30 flex h-16 flex-none items-center bg-white/90 backdrop-blur-xs lg:hidden lg:pl-64 dark:bg-gray-900/90"
        >
          <div className="container mx-auto flex w-full justify-between px-4 lg:px-8 xl:max-w-7xl">
            {/* Left Section */}
            <div className="flex flex-none items-center gap-4">
              {/* Toggle Sidebar on Mobile */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                type="button"
                className="group relative inline-flex w-full items-center gap-2 rounded-lg p-2 text-sm leading-5 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                <span className="absolute inset-0 scale-50 rounded-lg bg-gray-100 opacity-0 transition ease-out group-hover:scale-100 group-hover:opacity-100 group-active:scale-105 group-active:bg-gray-200 dark:bg-gray-700/50 dark:group-active:bg-gray-700/75" />
                <svg
                  className="hi-solid hi-menu-alt-1 relative inline-block size-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* END Toggle Sidebar on Mobile */}
            </div>
            {/* END Left Section */}

            {/* Center Section */}
            <div className="flex grow items-center justify-center lg:hidden">
              <a
                href="#"
                className="group inline-flex items-center gap-2 font-bold tracking-wide text-gray-900 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 73 49"
                  className="size-6"
                >
                  <path
                    fill="#38bdf8"
                    d="M46.868 24c0 12.426-10.074 22.5-22.5 22.5-12.427 0-22.5-10.074-22.5-22.5S11.94 1.5 24.368 1.5c12.426 0 22.5 10.074 22.5 22.5Z"
                  />
                  <path
                    fill="#a855f7"
                    d="M71.132 24c0 12.426-9.975 22.5-22.28 22.5-12.304 0-22.278-10.074-22.278-22.5S36.547 1.5 48.852 1.5c12.304 0 22.28 10.074 22.28 22.5Z"
                  />
                  <path
                    fill="#6b21a8"
                    d="M36.67 42.842C42.81 38.824 46.868 31.886 46.868 24c0-7.886-4.057-14.824-10.198-18.841A22.537 22.537 0 0 0 26.573 24 22.537 22.537 0 0 0 36.67 42.842Z"
                  />
                </svg>
                <span>Circles AI</span>
              </a>
            </div>
            {/* END Center Section */}

            {/* Right Section */}
            <div className="flex flex-none items-center gap-2">
              {/* Settings */}
              <button
                type="button"
                className="group relative inline-flex w-full items-center gap-2 rounded-lg p-1.5 text-sm leading-5 text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              >
                <span className="absolute inset-0 scale-50 rounded-lg bg-gray-100 opacity-0 transition ease-out group-hover:scale-100 group-hover:opacity-100 group-active:scale-105 group-active:bg-gray-200 dark:bg-gray-700/50 dark:group-active:bg-gray-700/75" />
                <span className="relative inline-block">
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 size-3 rounded-full border border-white bg-emerald-500" />
                  <img
                    src="https://cdn.tailkit.com/media/placeholders/avatar-bY4GXQKfZrA-160x160.jpg"
                    alt="User Avatar"
                    className="inline-block size-6 rounded-lg"
                  />
                </span>
              </button>
              {/* END Settings */}
            </div>
            {/* END Right Section */}
          </div>
        </header>
        {/* END Page Header */}

        {/* Page Content */}
        <main
          id="page-content"
          className="flex max-w-full flex-auto flex-col pt-16 lg:pt-0"
        >
          {/* Page Section */}
          {/* <div class="container mx-auto grow p-4 lg:p-8 xl:max-w-7xl">
            Page content..
          </div> */}
          {/* END Page Section */}

          {/* Placeholder */}
          <div className="container mx-auto flex w-full grow flex-col p-4 lg:p-8 xl:max-w-7xl">
            <div className="flex grow items-center justify-center rounded-xl border-2 border-dashed border-gray-200/75 py-96 text-gray-400 dark:border-gray-700/50">
              Page content...
            </div>
          </div>
          {/* END Placeholder */}
        </main>
        {/* END Page Content */}
      </div>
      {/* END Page Container */}
    </>
  );
}
