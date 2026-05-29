import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Github, Linkedin, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import avatars
import sherwinImg from '@/assets/team/sherwin.png';
import darrenImg from '@/assets/team/darren.png';
import alyssaImg from '@/assets/team/aly.png';
import philipImg from '@/assets/team/philip.jpg';
import ncLogo from '@/assets/nc_logo.png';

const TEAM_MEMBERS = [
    {
        name: 'Sherwin Adonis Vizcarra - II',
        role: 'Lead Developer',
        image: sherwinImg,
        description: 'System design & architecture, full-stack development, and scalable solutions.',
        links: [
            { icon: Github, href: 'https://github.com/tionic929' },
            { icon: Linkedin, href: 'https://www.linkedin.com/in/sherwin-adonis-vizcarra/' },
            { icon: Facebook, href: 'https://www.facebook.com/tionlc' },
            { icon: Instagram, href: 'https://www.instagram.com/tionlc/' },
        ]
    },
    {
        name: 'John Darren C. Del Castillo',
        role: 'Project Manager',
        image: darrenImg,
        description: 'Overseeing project lifecycle, timeline management, and team coordination.',
        links: [
            { icon: Github, href: '#' },
            { icon: Linkedin, href: '#' },
            { icon: Facebook, href: '#' },
            { icon: Instagram, href: '#' },
        ]
    },
    {
        name: 'Ma. Alyssa B. Abad',
        role: 'QA / Researcher',
        image: alyssaImg,
        description: 'Ensuring system reliability through rigorous testing and data-driven research.',
        links: [
            { icon: Github, href: '#' },
            { icon: Linkedin, href: '#' },
        ]
    },
    {
        name: 'Philip Joshua P. Tuliao',
        role: 'Documenter',
        image: philipImg,
        description: 'Maintaining technical standards and institutional knowledge through clear documentation.',
        links: [
            { icon: Github, href: '#' },
            { icon: Linkedin, href: '#' },
        ]
    }
];

export default function About() {
    return (
        // Use min-h-screen to allow scroll on mobile, md:h-screen/overflow-hidden to lock on desktop
        <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans selection:bg-teal-100 md:h-screen md:overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0">
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

            {/* Main Wrapper */}
            {/* Added py-12 to provide space on mobile, md:justify-center to center vertically on desktop */}
            <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:justify-center px-6 py-12 md:py-6 overflow-y-auto md:overflow-hidden">

                {/* Title Section */}
                <div className="text-center mb-10 shrink-0">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight"
                    >
                        Meet the Creators
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 mt-2 max-w-xl mx-auto text-sm md:text-base font-medium"
                    >
                        The team behind the Northeastern College ID Application System.
                    </motion.p>
                </div>

                {/* Team Grid */}
                {/* Responsive grid: 1 column on mobile, 4 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                    {TEAM_MEMBERS.map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                        >
                            <div className="mb-4 rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-black text-slate-900 text-sm">{member.name}</h3>
                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-1 mb-2">
                                    {member.role}
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                                    {member.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 shrink-0">
                                {member.links.map((link, i) => (
                                    <SocialLink key={i} icon={<link.icon className="h-3 w-3" />} href={link.href} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Credits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 text-center shrink-0 pb-6 md:pb-0"
                >
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                        Northeastern College BSIT 4B · © {new Date().getFullYear()}
                    </p>
                </motion.div>
            </main>
        </div>
    );
}

const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:bg-teal-600 hover:text-white flex items-center justify-center transition-colors"
    >
        {icon}
    </a>
);