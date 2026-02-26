import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock, Filter, Search, Download,
    User, Database, Shield, AlertCircle,
    FileText, ArrowRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const logs = [
    { id: 1, type: 'submission', user: 'Julius Caesar', action: 'Submitted new application', date: '2 mins ago', status: 'success' },
    { id: 2, type: 'auth', user: 'Admin System', action: 'Failed login attempt detected', date: '45 mins ago', status: 'warning' },
    { id: 3, type: 'system', user: 'Database', action: 'Automatic backup completed', date: '2 hours ago', status: 'info' },
    { id: 4, type: 'report', user: 'Admin User', action: 'Exported department statistics', date: '5 hours ago', status: 'success' },
    { id: 5, type: 'submission', user: 'Marcus Brutus', action: 'Updated profile details', date: '1 day ago', status: 'success' },
    { id: 6, type: 'system', user: 'System', action: 'Application deployed to production', date: '1 day ago', status: 'info' },
];

const History = () => {
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
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">Audit Trail</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">Logs</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
                                History
                            </h1>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold uppercase tracking-[0.1em]">
                                Monitoring Active
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm border-slate-200 gap-2">
                            <Download size={14} />
                            Export CSV
                        </Button>
                    </div>
                </motion.div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                    <div className="md:col-span-8 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Search by user, action, or date..."
                            className="pl-12 h-14 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary font-medium"
                        />
                    </div>
                    <div className="md:col-span-4 flex items-center gap-2">
                        <Button variant="outline" className="flex-1 h-14 rounded-2xl bg-white border-slate-100 text-slate-500 font-bold uppercase tracking-widest text-[10px] gap-2">
                            <Filter size={16} />
                            Filters
                        </Button>
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-4">
                    {logs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-[2rem] bg-card overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-6 gap-6">
                                        {/* Status Icon Indicator */}
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                            log.status === 'success' && "bg-emerald-50 text-emerald-600",
                                            log.status === 'warning' && "bg-amber-50 text-amber-600",
                                            log.status === 'info' && "bg-blue-50 text-blue-600"
                                        )}>
                                            {log.type === 'submission' && <FileText size={20} />}
                                            {log.type === 'auth' && <Shield size={20} />}
                                            {log.type === 'system' && <Database size={20} />}
                                            {log.type === 'report' && <Download size={20} />}
                                        </div>

                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.user}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2">{log.type}</Badge>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.date}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 line-clamp-1">{log.action}</p>
                                        </div>

                                        <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest gap-2">
                                                View Audit
                                                <ArrowRight size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-12 text-center">
                    <Button variant="ghost" className="h-14 rounded-[1.5rem] px-12 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all">
                        Load Historical Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default History;
