'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

import { useQuery } from '@tanstack/react-query'

import { resonator } from '@services'
import { useRooms, useUser } from '@stores'

export default function Chats() {
    const { user, isUserLoading } = useUser()
    const { rooms, isRoomLoading } = useRooms()

    return (
        <main className="flex flex-col max-w-md w-full mx-auto pb-4 md:pb-8">
            <header className="sticky top-0 flex justify-between items-center px-4 py-4">
                <Link href="/">
                    <h1 className="text-3xl font-semibold text-lime-800">
                        Chats
                    </h1>
                </Link>
                <section className="flex flex-row-reverse justify-end items-center gap-2">
                    <Link href="/profile">
                        <figure className="size-11 bg-lime-100 rounded-full overflow-hidden">
                            {isUserLoading || !user?.profile ? null : (
                                <img
                                    className="object-center object-fit"
                                    src={user.profile}
                                />
                            )}
                        </figure>
                    </Link>
                    <Link
                        className="flex justify-center items-center size-12 text-lime-700 bg-lime-100 hover:bg-amber-100 focus:bg-amber-100 hover:text-amber-700 focus:text-amber-700 transition-colors rounded-full"
                        href="/editor"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-edit transform scale-[.85]"
                        >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </Link>
                </section>
            </header>
            <ul className="flex flex-col gap-1">
                <AnimatePresence mode="popLayout">
                    {isRoomLoading
                        ? Array.from({ length: 8 }).map((_, i) => (
                              <a key={i.toString()}>
                                  <motion.article
                                      className={`flex items-center gap-3 md:gap-4 w-full px-4 py-3 md:p-2 md:rounded-xl ${
                                          isRoomLoading ? '' : 'animate-pulse'
                                      }`}
                                      exit={{
                                          opacity: 0,
                                          transition: {
                                              duration: 0.2,
                                              delay: i * 0.0125
                                          }
                                      }}
                                  >
                                      <div className="size-12 min-w-12 md:size-14 md:min-w-14 rounded-full bg-lime-100" />
                                      <section className="flex flex-col w-full gap-2 overflow-hidden">
                                          <h2 className="text-lime-800 text-xl w-48 h-6 md:h-8 bg-lime-100 rounded" />
                                          <p className="text-lime-600 text-sm whitespace-nowrap text-ellipsis overflow-hidden w-full h-4 bg-lime-100 rounded" />
                                      </section>
                                  </motion.article>
                              </a>
                          ))
                        : rooms.map(
                              ({
                                  character: { id, name, greeting, image }
                              }) => (
                                  <Link href={`/chat/${id}`} key={id}>
                                      <article className="flex items-center gap-3 md:gap-4 w-full px-4 py-3 md:p-2 sm:rounded-2xl hover:bg-lime-100 transition-colors">
                                          <img
                                              src={image ?? ''}
                                              alt={name}
                                              className="size-12 md:size-14 min-w-12 md:min-w-14 rounded-full object-cover object-center items-center"
                                          />
                                          <section className="flex flex-col w-full overflow-hidden">
                                              <h2 className="text-lime-800 text-xl md:text-2xl">
                                                  {name}
                                              </h2>
                                              <p className="text-lime-600 text-sm w-full whitespace-nowrap text-ellipsis overflow-hidden">
                                                  {greeting}
                                              </p>
                                          </section>
                                      </article>
                                  </Link>
                              )
                          )}
                </AnimatePresence>
            </ul>
        </main>
    )
}
