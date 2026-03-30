import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import avatars
import sherwinImg from '@/assets/team/sherwin.jpg';
import darrenImg from '@/assets/team/darren.jpg';
import alyssaImg from '@/assets/team/aly.png';
import philipImg from '@/assets/team/philip.jpg';
import ncLogo from '@/assets/nc_logo.png';

const TEAM_MEMBERS = [
    {
        name: 'Sherwin Adonis Vizcarra - II',
        role: 'Lead Developer & Architect',
        image: sherwinImg,
        description: 'Passionate about building scalable systems and crafting beautiful user interfaces.',
    },
    {
        name: 'John Darren C. Del Castillo',
        role: 'Backend Developer',
        image: darrenImg,
        description: 'Specializes in robust backend architectures and API integrations.',
    },
    {
        name: 'Ma. Alyssa B. Abad',
        role: 'UI/UX Designer',
        image: alyssaImg,
        description: 'Focused on delivering intuitive user experiences and modern design aesthetics.',
    },
    {
        name: 'Philip Joshua P. Tuliao',
        role: 'Frontend Developer',
        image: philipImg,
        description: 'Dedicated to bringing designs to life with responsive state-of-the-art frontend code.',
    }
];

export default function About() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#eef3ff] flex flex-col font-inter">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-[#001f3f] transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                        <span className="font-bold text-sm tracking-wide">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <img src={ncLogo} alt="NC Logo" className="h-8 w-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <h1 className="font-black text-lg text-[#001f3f] tracking-tight">ID TECH</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-[#001f3f] tracking-tight"
                    >
                        Meet the Creators
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 leading-relaxed"
                    >
                        We are the NC BSIT 4B team. A group of passionate students and developers dedicated to modernizing the institutional identification system.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {TEAM_MEMBERS.map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 2) }}
                            className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-[#001f3f]/10 transition-all duration-300 group flex flex-col h-full"
                        >
                            <div className="relative mb-6 rounded-2xl overflow-hidden aspect-square border-4 border-slate-50">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{member.name}</h3>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 mt-1">{member.role}</p>
                                <p className="text-sm text-slate-500 leading-relaxed flex-1">
                                    {member.description}
                                </p>

                                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                                    <button className="h-8 w-8 rounded-full bg-slate-50 hover:bg-[#001f3f] hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                                        <Github className="h-4 w-4" />
                                    </button>
                                    <button className="h-8 w-8 rounded-full bg-slate-50 hover:bg-[#001f3f] hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                                        <Linkedin className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 text-center"
                >
                    <div className="inline-block bg-[#001f3f] text-white px-8 py-4 rounded-2xl shadow-lg shadow-[#001f3f]/20">
                        <p className="font-bold tracking-wide">Developed as a final project for Northeastern College.</p>
                        <p className="text-sm text-blue-200 mt-1 opacity-80">© {new Date().getFullYear()} All Rights Reserved.</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
