import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../shared/components/layout/Sidebar'
import Navbar from '../../shared/components/layout/Navbar'

const DashboardPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen overflow-x-hidden fondo-vault">
            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main
                    className="flex-1 p-4 lg:p-8 overflow-y-auto pb-24 lg:pb-8"
                    style={{ minHeight: 0 }}
                >
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DashboardPage