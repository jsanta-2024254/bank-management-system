import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../shared/components/layout/Sidebar'
import Navbar from '../../shared/components/layout/Navbar'
    return (
        <div className="relative flex min-h-screen overflow-x-hidden bg-[#f2e6cf] text-[#3b2a14]">
            <div className="premium-marble-bg pointer-events-none fixed inset-0" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.2),rgba(210,166,74,0.12))]" />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#2f1f0b]/35 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 lg:px-8 lg:py-7 lg:pb-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )

            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
<<<<<<< HEAD
                <main
                    className="flex-1 p-4 lg:p-8 overflow-y-auto pb-24 lg:pb-8"
                    style={{ minHeight: 0 }}
                >
                    <div className="max-w-7xl mx-auto">
=======

                <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 lg:px-8 lg:py-7 lg:pb-8">
                    <div className="mx-auto max-w-7xl">
>>>>>>> 59ccc5e4a4022aba6b21481ac50937243189c611
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DashboardPage