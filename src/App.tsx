import React from 'react';
import {
    CheckCircle2,
    TrendingUp,
    Zap,
    Layers,
    ShieldCheck,
    Clock,
    FileText,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    ChevronRight,
    Bell,
    Search
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
    color?: string;
    index: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon, color, index }) => {
    return (
        <div className="kpi-card" style={{ '--i': index } as React.CSSProperties}>
            <div className="kpi-content">
                <div className="kpi-title">{title}</div>
                <div className="kpi-value-container">
                    <div className="kpi-value">{value}</div>
                    {trend !== undefined && (
                        <div className={`kpi-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const mockGraphData = [
    { name: 'Mon', route_A: 92, route_B: 85, route_C: 98 },
    { name: 'Tue', route_A: 88, route_B: 82, route_C: 95 },
    { name: 'Wed', route_A: 95, route_B: 89, route_C: 92 },
    { name: 'Thu', route_A: 94, route_B: 91, route_C: 88 },
    { name: 'Fri', route_A: 97, route_B: 88, route_C: 96 },
    { name: 'Sat', route_A: 91, route_B: 94, route_C: 94 },
    { name: 'Sun', route_A: 96, route_B: 96, route_C: 99 },
];

function App() {
    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="logo">
                    <div className="logo-icon">S</div>
                    <span>Supply Chain Solutions</span>
                </div>
                <nav>
                    <div className="nav-item active"><Activity size={18} /> Dashboard</div>
                    <div className="nav-item"><Search size={18} /> RCA Analysis</div>
                    <div className="nav-item"><Layers size={18} /> Slot Booking Optimizer</div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">AD</div>
                        <div className="user-info">
                            <div className="user-name">Admin User</div>
                            <div className="user-role">Operations Lead</div>
                        </div>
                        <button className="icon-btn" style={{ marginLeft: 'auto' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header>
                    <div className="header-title">
                        <h1>Operational Intelligence</h1>
                        <p>Real-time performance tracking and resource optimization</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button className="icon-btn" style={{ background: 'white', border: '1px solid var(--border-card)', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                <div className="main-grid">
                    <div className="main-left">
                        <div className="kpi-grid">
                            <KPICard
                                index={1}
                                title="Compliance %"
                                value="94.2%"
                                trend={2.4}
                                icon={<CheckCircle2 size={24} />}
                                color="#10b981"
                            />
                            <KPICard
                                index={2}
                                title="Positive vs Negative %"
                                value="98.1%"
                                trend={0.5}
                                icon={<TrendingUp size={24} />}
                                color="#3b82f6"
                            />
                            <KPICard
                                index={3}
                                title="Slot Capacity %"
                                value="76.8%"
                                trend={4.1}
                                icon={<Layers size={24} />}
                                color="#8b5cf6"
                            />
                            <KPICard
                                index={4}
                                title="Average Delay (mins)"
                                value="14.2"
                                trend={-8.5}
                                icon={<Clock size={24} />}
                                color="#f97316"
                            />
                            <KPICard
                                index={5}
                                title="Contract Compliance %"
                                value="91.4%"
                                trend={0.2}
                                icon={<FileText size={24} />}
                                color="#06b6d4"
                            />
                            <KPICard
                                index={6}
                                title="Cost Variance %"
                                value="+2.1%"
                                trend={1.5}
                                icon={<DollarSign size={24} />}
                                color="#ef4444"
                            />
                        </div>

                        <div className="chart-card" style={{ marginBottom: '2rem' }}>
                            <div className="chart-header">
                                <h2 className="chart-title">Warehouse Movement Analysis</h2>
                                <p className="chart-subtitle">Productivity vs Unproductive Movement (Waste)</p>
                            </div>
                            <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        layout="vertical"
                                        data={[
                                            { name: 'Productivity', value: 87.5 },
                                            { name: 'Unproductive', value: 12.5 }
                                        ]}
                                        margin={{ left: 20, right: 40, top: 10, bottom: 10 }}
                                    >
                                        <defs>
                                            <linearGradient id="barGradientProd" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                                            </linearGradient>
                                            <linearGradient id="barGradientUnprod" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={120}
                                            tick={{ fill: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                                            <Cell fill="url(#barGradientProd)" />
                                            <Cell fill="url(#barGradientUnprod)" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem', padding: '0 1rem' }}>
                                <div style={{ borderLeft: '4px solid #10b981', paddingLeft: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Productivity</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        87.5% <span style={{ fontSize: '0.813rem', color: 'var(--color-negative)', fontWeight: 700 }}>-1.2%</span>
                                    </div>
                                    <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>“Docks working or waiting?”</p>
                                </div>
                                <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Unproductive</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        12.5% <span style={{ fontSize: '0.813rem', color: 'var(--color-positive)', fontWeight: 700 }}>+0.8%</span>
                                    </div>
                                    <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>“Wasted effort or pure flow?”</p>
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h2 className="chart-title">On-Time Performance Trend by Route</h2>
                                <p className="chart-subtitle">Analyzing performance stability across top transit corridors</p>
                            </div>
                            <div style={{ width: '100%', height: 420 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={mockGraphData}>
                                        <defs>
                                            <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="var(--text-muted)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={15}
                                        />
                                        <YAxis
                                            stroke="var(--text-muted)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val: number) => `${val}%`}
                                            dx={-15}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid var(--border-card)',
                                                borderRadius: '16px',
                                                boxShadow: 'var(--shadow-lg)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="route_A"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorA)"
                                            name="North Corridor"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="route_B"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorB)"
                                            name="South Express"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <aside className="carrier-segment">
                        <div className="carrier-header">
                            <div className="carrier-score-circle">
                                <ShieldCheck size={40} color="var(--color-accent)" style={{ marginBottom: '8px' }} />
                                <div className="carrier-score-value">9.2</div>
                                <div className="carrier-score-label">Confidence</div>
                            </div>
                            <div className="carrier-info">
                                <h3 className="carrier-title">BlueLine Logistics</h3>
                                <p className="carrier-short">“Best-in-class fulfillment partner”</p>
                            </div>
                        </div>

                        <div className="carrier-stats">
                            <div className="carrier-stat-item">
                                <span className="carrier-stat-label">Reliability Index</span>
                                <span className="carrier-stat-value" style={{ color: 'var(--color-positive)' }}>
                                    <ArrowUpRight size={14} style={{ marginRight: '4px' }} />
                                    1.8%
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default App;
