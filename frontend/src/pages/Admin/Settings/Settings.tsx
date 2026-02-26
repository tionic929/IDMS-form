import React from 'react';
import { motion } from 'framer-motion';
import {
    User, Shield, Bell, Palette, Globe,
    Mail, Camera, Save, Lock, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Settings = () => {
    return (
        <div className="bg-slate-50 min-h-screen text-slate-950 font-sans selection:bg-primary/10">
            <div className="px-6 py-8 lg:px-12 lg:py-12 max-w-[1200px] mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 relative"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">System</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">Configuration</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Settings</h1>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-bold uppercase tracking-[0.1em]">
                                <Shield className="h-3 w-3" />
                                Security Verified
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-2">
                        {[
                            { id: 'profile', label: 'Profile', icon: User, active: true },
                            { id: 'security', label: 'Security', icon: Shield },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'appearance', label: 'Appearance', icon: Palette },
                            { id: 'regional', label: 'Regional', icon: Globe },
                        ].map((item) => (
                            <button
                                key={item.id}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
                                    item.active
                                        ? "bg-white text-primary shadow-lg shadow-primary/5 border border-slate-100"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                )}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        <Card className="border-none shadow-xl shadow-primary/5 rounded-[2.5rem] bg-card overflow-hidden">
                            <CardHeader className="p-8 border-b border-slate-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black uppercase tracking-tight">Admin Profile</CardTitle>
                                        <CardDescription className="text-xs font-medium text-muted-foreground mt-1">Manage your public information and avatar</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3">Primary Account</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-10">

                                {/* Avatar Section */}
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                            <User size={40} className="text-slate-300" />
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-1 text-center sm:text-left">
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Profile Picture</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">JPG, GIF or PNG. Max size of 2MB</p>
                                        <div className="flex items-center gap-2 pt-2 justify-center sm:justify-start">
                                            <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-xl">Upload New</Button>
                                            <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">Remove</Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <Input placeholder="Julius Caesar" className="h-12 rounded-2xl bg-slate-50/50 border-slate-200 focus:ring-primary focus:border-primary font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <Input placeholder="julius@ncnian-id.site" className="h-12 rounded-2xl bg-slate-50/50 border-slate-200 focus:ring-primary focus:border-primary font-medium" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                                    <textarea className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50/50 border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium text-sm transition-all" placeholder="Manage overall security and system operations..." />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-between p-8 bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-zinc-950/20 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                <Zap size={120} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-sm font-black uppercase tracking-widest">Update Security Settings</h4>
                                <p className="text-[10px] text-zinc-400 font-medium mt-1">Strengthen your account protection with 2FA</p>
                            </div>
                            <Button className="relative z-10 bg-white text-zinc-950 hover:bg-zinc-100 rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 h-12 shadow-xl">
                                Configure Now
                            </Button>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <Button variant="ghost" className="h-12 rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest opacity-60">Reset Changes</Button>
                            <Button className="h-12 rounded-2xl px-10 font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 gap-2">
                                <Save size={16} />
                                Save Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
