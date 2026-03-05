import React, { useState, useEffect } from 'react';
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
    Search,
    Bot,
    MessageSquare,
    Sparkles,
    Send,
    HelpCircle,
    Clock3,
    FileBarChart,
    Loader2,
    Menu,
    ChevronLeft,
    Truck,
    RotateCcw,
    PackageSearch,
    AlertTriangle
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

const AgentFace = ({ animate = false }: { animate?: boolean }) => (
    <div className="agent-face-wrapper">
        <div className={`agent-pulse ${animate ? 'active' : ''}`}></div>
        <div className="agent-container">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 60C100 82.0914 82.0914 100 60 100C37.9086 100 20 82.0914 20 60C20 37.9086 37.9086 20 60 20C82.0914 20 100 37.9086 100 60Z" stroke="url(#paint0_linear)" strokeWidth="4" />
                <path d="M60 100L50 115L40 100H60Z" fill="url(#paint0_linear)" />
                <rect x="35" y="45" width="50" height="30" rx="15" fill="white" fillOpacity="0.1" stroke="url(#paint0_linear)" strokeWidth="2" />
                <circle className="agent-eye" cx="50" cy="60" r="3" fill="url(#paint0_linear)" />
                <circle className="agent-eye" cx="70" cy="60" r="3" fill="url(#paint0_linear)" />
                <defs>
                    <linearGradient id="paint0_linear" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#e5b611" />
                        <stop offset="1" stopColor="#f5d547" />
                    </linearGradient>                </defs>
            </svg>
        </div>
    </div>
);

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [rcaState, setRcaState] = useState<'initial' | 'suggesting' | 'loading' | 'response' | 'error'>('initial');
    const [suggestedShipments, setSuggestedShipments] = useState<any[]>([]);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [rcaReport, setRcaReport] = useState<string>('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [allTables, setAllTables] = useState<any>(null);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Activity size={18} /> },
        { id: 'rca', label: 'RCA Analysis', icon: <Search size={18} /> },
        { id: 'transport', label: 'Transport Optimizer', icon: <Truck size={18} /> },
        { id: 'reverse', label: 'Reverse Logistics', icon: <RotateCcw size={18} /> },
        { id: 'consolidation', label: 'Load Consolidation', icon: <Layers size={18} /> },
        { id: 'disruption', label: 'Disruption Response', icon: <AlertTriangle size={18} /> }
    ];

    // Load suggested shipments from dashboard_data.json
    useEffect(() => {
        fetch('/dashboard_data.json')
            .then(res => res.json())
            .then(data => {
                if (data.shipments) setSuggestedShipments(data.shipments);
                if (data.tables) setAllTables(data.tables);
            })
            .catch(err => console.error("Error loading dashboard data:", err));
    }, []);

    const handleRCAReportClick = () => {
        setRcaState('suggesting');
    };

    const DataTableViewer = ({ data }: { data: any }) => {
        if (!data) return null;
        const [activeTableTab, setActiveTableTab] = useState(Object.keys(data)[0]);
        const [currentPage, setCurrentPage] = useState(0);
        const rowsPerPage = 10;

        const currentRows = data[activeTableTab] || [];
        const totalPages = Math.ceil(currentRows.length / rowsPerPage);
        const displayRows = currentRows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

        // Define relevant columns for each sheet to fit screen better
        const getRelevantColumns = (tab: string, allCols: string[]) => {
            const config: any = {
                "Orders": ['order_id', 'customer_id', 'order_date', 'priority_level', 'order_status', 'price'],
                "Shipments": ['shipment_id', 'route_id', 'shipment_status', 'actual_dispatch_time', 'delay_minutes'],
                "Routes": ['route_id', 'origin_city', 'destination_city', 'distance_km', 'toll_cost_estimate'],
                "Carriers": ['carrier_id', 'carrier_name', 'sla_score', 'ontime_percentage', 'avg_delay_minutes'],
                "Warehouses": ['warehouse_id', 'warehouse_name', 'city', 'total_docks', 'warehouse_congestion_score'],
                "Slots": ['slot_id', 'warehouse_id', 'slot_number', 'slot_status', 'waiting_time_minutes']
            };
            return config[tab] || allCols.slice(0, 6);
        };

        const allColumns = displayRows.length > 0 ? Object.keys(displayRows[0]) : [];
        const columns = getRelevantColumns(activeTableTab, allColumns);

        return (
            <div className="data-table-container animate-in">
                <div className="chart-header">
                    <h2 className="chart-title">Global Inventory & Logistics Audit</h2>
                    <p className="chart-subtitle">Cross-sheet analysis of orders, routes, and carrier performance</p>
                </div>

                <div className="data-tabs">
                    {Object.keys(data).map((tab: any) => (
                        <div
                            key={tab}
                            className={`data-tab ${activeTableTab === tab ? 'active' : ''}`}
                            onClick={() => { setActiveTableTab(tab); setCurrentPage(0); }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                <div className="table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                {columns.map((col: any) => <th key={col}>{col.replace(/_/g, ' ').replace(/minutes/gi, 'hours').replace(/mins/gi, 'hours')}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {displayRows.map((row: any, i: number) => (
                                <tr key={i}>
                                    {columns.map((col: any) => (
                                        <td key={col}>
                                            <span style={{
                                                color: typeof row[col] === 'number' && row[col] > 100 ? 'var(--color-negative)' : 'inherit',
                                                fontWeight: typeof row[col] === 'number' ? 700 : 500
                                            }}>
                                                {(() => {
                                                    const val = row[col];
                                                    if (typeof val === 'number') {
                                                        const colLower = col.toLowerCase();
                                                        // Convert minutes to hours
                                                        if (colLower.includes('minutes') || colLower.includes('mins')) {
                                                            return (val / 60).toFixed(2);
                                                        }
                                                        // Add currency sign
                                                        if (colLower.includes('cost') || colLower.includes('price') ||
                                                            colLower.includes('estimate') || colLower.includes('fee') ||
                                                            (colLower.includes('penalty') && colLower.includes('rate'))) {
                                                            return `$${val.toLocaleString()}`;
                                                        }
                                                        return val.toLocaleString();
                                                    }
                                                    return val?.toString() || '-';
                                                })()}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-controls">
                    <div className="page-info">
                        Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, currentRows.length)} of {currentRows.length} entries
                    </div>
                    <div className="pagination-btns">
                        <button
                            className="page-btn"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="page-btn"
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleShipmentSelect = async (shipment: any) => {
        setSelectedShipment(shipment);
        setRcaState('loading');

        try {
            const N8N_WEBHOOK_URL = '/api/n8n';
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shipment_id: shipment.shipment_id,
                    features: {
                        delay_minutes: shipment.delay_minutes,
                        detention_cost: shipment.detention_cost,
                        congestion_score: shipment.congestion_score,
                        weather_risk_score: shipment.weather_risk_score,
                        distance_km: shipment.distance_km,
                        avg_delay_minutes: shipment.avg_delay_minutes,
                        ontime_percentage: shipment.ontime_percentage,
                        rejection_rate: shipment.rejection_rate,
                    },
                    full_data: shipment,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error(`Webhook error`);

            const result = await response.json();
            if (result.rca_class) {
                setRcaReport(JSON.stringify(result));
            } else {
                setRcaReport(result.message || 'Analysis completed');
            }
            setRcaState('response');
        } catch (error) {
            console.warn("n8n connection failed, using dummy demo fallback.");

            // Dummy Data Logic for Demo
            setTimeout(() => {
                const categories = ['Operational', 'Weather', 'Traffic', 'Manual Review'];
                const selectedCat = categories[Math.floor(Math.random() * categories.length)];
                const delay_val = (shipment.delay_minutes || 150);
                const delay_hours = (delay_val / 60).toFixed(2);

                const dummyPool: any = {
                    'Operational': {
                        root_cause: `The primary root cause for the ${delay_hours}-hour delay is identified as operational, with a confidence level of 0.7681. This indicates a disruption or inefficiency within the execution phase of the shipment, potentially related to loading/unloading processes or internal handling.`,
                        confidence: 0.7681,
                        impact: `Operational Impact:\n- Direct delay of ${delay_hours} hours disrupting downstream logistics.\n- Increased resource idleness (driver wait time).\n\nFinancial Impact:\n- Potential for driver detention fees.\n- Risk of penalties for late delivery.`,
                        improvements: `Recommended Corrective Actions:\n- Investigate specific failure points at the loading hub.\n- Review current SOPs for this operational segment.`
                    },
                    'Weather': {
                        root_cause: `A severe weather event along the northern transit corridor has caused a ${delay_hours}-hour deviation. Low visibility and heavy precipitation required reduced carrier speeds for safety compliance.`,
                        confidence: 0.7842,
                        impact: `Logistics Impact:\n- Speed reduction across a 200km segment.\n- Rerouting required for subsequent legs.\n\nRisk Assessment:\n- Potential for further cascaded delays in the network.`,
                        improvements: `Preventive Actions:\n- Integrate real-time weather metadata into route planning.\n- Increase buffer times during known monsoon/winter seasons.`
                    },
                    'Traffic': {
                        root_cause: `Extreme port congestion and urban traffic volume near the destination hub resulted in a ${delay_hours}-hour delay. The congestion index peaked at 8.4 during the transit window.`,
                        confidence: 0.7594,
                        impact: `Network Impact:\n- Missed warehouse slot window.\n- High fuel wastage due to excessive idling in traffic.`,
                        improvements: `Optimization Steps:\n- Shift delivery windows to off-peak hours.\n- Utilize dynamic route optimization to bypass known bottlenecks.`
                    },
                    'Manual Review': {
                        root_cause: `Documentation discrepancies were flagged during the checkpoint scan, necessitating a ${delay_hours}-hour manual review by the compliance team. The issue was traced to an incomplete manifest entry.`,
                        confidence: 0.7921,
                        impact: `Compliance Impact:\n- Temporary shipment hold.\n- Manual intervention required from back-office support.`,
                        improvements: `Process Fixes:\n- Automate manifest validation at the point of origin.\n- Implement digital twin verification for all shipping documents.`
                    }
                };

                const reportData = {
                    rca_class: selectedCat,
                    ...dummyPool[selectedCat]
                };

                setRcaReport(JSON.stringify(reportData));
                setRcaState('response');
            }, 1000);
        }
    };

    return (
        <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <img src="/logo.png" alt="Supply Chain Solutions" className="sidebar-logo-img" />
                        {!isSidebarCollapsed && <span>Supply Chain Solutions</span>}
                    </div>
                    <button
                        className="collapse-toggle"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
                <nav>
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                            title={isSidebarCollapsed ? item.label : ''}
                        >
                            {item.icon} {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">AD</div>
                        {!isSidebarCollapsed && (
                            <>
                                <div className="user-info">
                                    <div className="user-name">Admin User</div>
                                    <div className="user-role">Operations Lead</div>
                                </div>
                                <button className="icon-btn" style={{ marginLeft: 'auto' }}>
                                    <ChevronRight size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header>
                    <div className="header-title">
                        <h1>
                            {activeTab === 'dashboard' ? 'Supply Chain Tower - ABI' :
                                activeTab === 'rca' ? 'RCA Analysis Agent' :
                                    navItems.find(i => i.id === activeTab)?.label}
                        </h1>
                        <p>
                            {activeTab === 'dashboard' ? 'Real-time performance tracking and resource optimization' :
                                activeTab === 'rca' ? 'Deep dive into shipment delays and operational bottlenecks' :
                                    `Optimizing ${navItems.find(i => i.id === activeTab)?.label} workflows`}
                        </p>
                    </div>

                </header>

                {activeTab === 'dashboard' ? (
                    <div className="main-grid">
                        <div className="main-left">
                            <div className="kpi-grid">
                                <KPICard
                                    index={1}
                                    title="Total Orders"
                                    value="24,000"
                                    trend={5.2}
                                    icon={<Zap size={24} />}
                                    color="#06b6d4"
                                />
                                <KPICard
                                    index={2}
                                    title="OTIF %"
                                    value="28.5%"
                                    trend={-12.4}
                                    icon={<TrendingUp size={24} />}
                                    color="#3b82f6"
                                />
                                <KPICard
                                    index={3}
                                    title="Compliance %"
                                    value="94.2%"
                                    trend={+2.4}
                                    icon={<CheckCircle2 size={24} />}
                                    color="#10b981"
                                />
                                <KPICard
                                    index={4}
                                    title="Average Delay (hours)"
                                    value={(80.6 / 60).toFixed(2)}
                                    trend={-8.5}
                                    icon={<Clock size={24} />}
                                    color="#f97316"
                                />
                                <KPICard
                                    index={5}
                                    title="Slot Capacity %"
                                    value="76.8%"
                                    trend={4.1}
                                    icon={<Layers size={24} />}
                                    color="#8b5cf6"
                                />
                                <KPICard
                                    index={6}
                                    title="Cost Variance %"
                                    value="+7.7%"
                                    trend={1.5}
                                    icon={<DollarSign size={24} />}
                                    color="#ef4444"
                                />
                            </div>
                        </div>

                        <aside className="carrier-segment">
                            <div className="carrier-header">
                                <div className="carrier-score-circle">
                                    <ShieldCheck size={40} color="var(--color-accent)" style={{ marginBottom: '8px' }} />
                                    <div className="carrier-score-value">8.6</div>
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

                        <DataTableViewer data={allTables} />

                        <div className="chart-card" style={{ marginBottom: '2rem', marginTop: '2rem' }}>
                            <div className="chart-header">
                                <h2 className="chart-title">Warehouse Movement Analysis</h2>
                                <p className="chart-subtitle">Productivity vs Unproductive Movement (Waste)</p>
                            </div>
                            <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        layout="vertical"
                                        data={[
                                            { name: 'Productivity', value: 45.8 },
                                            { name: 'Unproductive', value: 54.2 }
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
                                        45.8% <span style={{ fontSize: '0.813rem', color: 'var(--color-negative)', fontWeight: 700 }}>-18.4%</span>
                                    </div>
                                </div>
                                <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Unproductive</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        54.2% <span style={{ fontSize: '0.813rem', color: 'var(--color-positive)', fontWeight: 700 }}>+22.1%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="chart-card" style={{ marginBottom: '2rem' }}>
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
                ) : activeTab === 'rca' ? (
                    <div className="rca-container">
                        <div className="rca-content-wrapper">
                            <AgentFace animate={rcaState === 'loading'} />

                            {rcaState === 'initial' && (
                                <>
                                    <div className="rca-text-box">
                                        <h2 className="rca-title">Operational RCA Intelligence</h2>
                                        <p className="rca-description">Hello, I'm your AI logistics auditor. How may I help you today?</p>
                                    </div>
                                    <div className="rca-button-grid">
                                        <button className="rca-action-btn" onClick={handleRCAReportClick}>
                                            <div className="rca-btn-icon"><FileBarChart size={20} /></div>
                                            <span>Generate RCA Report for a Shipment</span>
                                            <ChevronRight size={16} className="arrow" />
                                        </button>
                                        <button className="rca-action-btn">
                                            <div className="rca-btn-icon"><Clock3 size={20} /></div>
                                            <span>Analyze Delay Trends</span>
                                            <ChevronRight size={16} className="arrow" />
                                        </button>
                                    </div>
                                </>
                            )}

                            {rcaState === 'suggesting' && (
                                <div className="rca-suggestions animate-in" style={{ width: '100%', maxWidth: '600px' }}>
                                    <div className="suggestion-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                        <h2 className="rca-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Flagged Shipments</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>High-priority shipments requiring immediate RCA</p>
                                    </div>

                                    <div className="shipment-single-view" style={{ width: '100%' }}>
                                        <div className="shipment-column">
                                            <div className="column-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-negative)', padding: '8px', borderRadius: '10px' }}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Priority Issues</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Significant delays detected</p>
                                                </div>
                                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'var(--color-negative)', color: 'white', padding: '2px 10px', borderRadius: '100px', fontWeight: 800 }}>
                                                    {suggestedShipments.filter(s => s.delay_minutes > 100).length}
                                                </span>
                                            </div>
                                            <div className="shipment-list-scroll" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                                {suggestedShipments
                                                    .filter(s => s.delay_minutes > 100)
                                                    .sort((a, b) => b.delay_minutes - a.delay_minutes)
                                                    .map((s, idx) => (
                                                        <div key={`flagged-${idx}`} className="shipment-item compact-card" onClick={() => handleShipmentSelect(s)} style={{ marginBottom: '0.75rem', padding: '1rem' }}>
                                                            <div className="shipment-info">
                                                                <div className="shipment-id" style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.shipment_id}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.route_id}</div>
                                                            </div>
                                                            <div className="shipment-status-meta" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                                                <div style={{ color: 'var(--color-negative)', fontWeight: 800, fontSize: '0.9rem' }}>+{(s.delay_minutes / 60).toFixed(2)}h</div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>DELAY</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button className="back-link" onClick={() => setRcaState('initial')} style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '2.5rem auto' }}>
                                        <RotateCcw size={16} /> Return to Intelligence Agent
                                    </button>
                                </div>
                            )}

                            {rcaState === 'loading' && (
                                <div className="rca-loading">
                                    <div className="loading-spinner">
                                        <Loader2 className="animate-spin" size={40} color="var(--color-accent)" />
                                    </div>
                                    <p>AI Agent is analyzing Shipment #{selectedShipment?.shipment_id}...</p>
                                    <p className="loading-sub">Connecting to n8n workflow engine...</p>
                                </div>
                            )}

                            {rcaState === 'response' && (
                                <div className="rca-response animate-in">
                                    <div className="response-header">
                                        <Bot size={24} color="var(--color-accent)" />
                                        <span>RCA Analysis Result</span>
                                    </div>
                                    <div className="response-body">
                                        <div className="shipment-summary" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Shipment ID</span>
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>#{selectedShipment?.shipment_id}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Planned Route</span>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-accent)' }}>{selectedShipment?.route_id}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Delay Duration</span>
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-negative)' }}>{(selectedShipment?.delay_minutes / 60).toFixed(2)} hrs</span>
                                            </div>
                                        </div>

                                        {(() => {
                                            try {
                                                const data = JSON.parse(rcaReport);
                                                return (
                                                    <div className="structured-report">
                                                        <div className="rca-header-meta" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                                                            <div className="rca-category-box">
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>RCA CATEGORY</span>
                                                                <div className="rca-badge" style={{
                                                                    background: data.rca_class === 'Weather' ? 'rgba(59, 130, 246, 0.15)' :
                                                                        data.rca_class === 'Operational' ? 'rgba(229, 182, 17, 0.15)' :
                                                                            data.rca_class === 'Traffic' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                                                                    border: `1px solid ${data.rca_class === 'Weather' ? '#3b82f6' :
                                                                        data.rca_class === 'Operational' ? 'var(--color-accent)' :
                                                                            data.rca_class === 'Traffic' ? '#10b981' : '#8b5cf6'}`,
                                                                    padding: '0.5rem 1.25rem',
                                                                    borderRadius: '10px',
                                                                    fontSize: '1rem',
                                                                    fontWeight: 800,
                                                                    color: data.rca_class === 'Weather' ? '#3b82f6' :
                                                                        data.rca_class === 'Operational' ? 'var(--color-accent)' :
                                                                            data.rca_class === 'Traffic' ? '#10b981' : '#8b5cf6'
                                                                }}>
                                                                    {data.rca_class || 'General Issue'}
                                                                </div>
                                                            </div>
                                                            <div className="confidence-meter" style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                                                                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>AI CONFIDENCE</span>
                                                                    <span style={{ fontWeight: 800, color: 'var(--color-accent)' }}>{Math.round((data.confidence || 0) * 100)}%</span>
                                                                </div>
                                                                <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{
                                                                        background: 'var(--color-accent)',
                                                                        width: `${(data.confidence || 0) * 100}%`,
                                                                        height: '100%',
                                                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                                                    }} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="rca-scroll-area" style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '1rem' }}>
                                                            {/* Root Cause Section */}
                                                            <div className="analysis-section" style={{ marginBottom: '2rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--color-accent)' }}>
                                                                    <Search size={18} />
                                                                    <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, fontSize: '0.9rem' }}>Root Cause Analysis</h4>
                                                                </div>
                                                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                                                    {data.root_cause || data.message || "Primary analysis of data logs indicates an unexpected deviation in the delivery schedule. Correlation with current variables is highly likely."}
                                                                </div>
                                                            </div>

                                                            {/* Impact Section */}
                                                            <div className="analysis-section" style={{ marginBottom: '2rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#ef4444' }}>
                                                                    <Activity size={18} />
                                                                    <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, fontSize: '0.9rem' }}>Business Impact</h4>
                                                                </div>
                                                                <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: '1.25rem', whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '0.95rem', color: '#000000', fontWeight: 500 }}>
                                                                    {data.impact || "Analysis indicates potential disruption to downstream schedules and risk of SLA non-compliance."}
                                                                </div>
                                                            </div>

                                                            {/* Improvements Section */}
                                                            <div className="analysis-section">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#10b981' }}>
                                                                    <TrendingUp size={18} />
                                                                    <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, fontSize: '0.9rem' }}>Recommended Improvements</h4>
                                                                </div>
                                                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#000000', padding: '1.25rem', borderRadius: '1rem', whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '0.95rem', fontWeight: 500 }}>
                                                                    {data.improvements || "Reviewing carrier communication protocols and implementing tighter checkpoint monitoring is recommended."}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            } catch (e) {
                                                return <p className="report-text">{rcaReport}</p>;
                                            }
                                        })()}
                                    </div>
                                    <div className="response-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                                        <button className="rca-action-btn small" onClick={() => setRcaState('initial')} style={{ margin: '0 auto', display: 'flex' }}>
                                            <RotateCcw size={16} /> Perform Another Analysis
                                        </button>
                                    </div>
                                </div>
                            )}

                            {rcaState === 'error' && (
                                <div className="rca-error animate-in">
                                    <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                                    <h3>Connection Failed</h3>
                                    <p>Could not connect to the n8n workflow engine. Please ensure your webhook is active and the URL is correct.</p>
                                    <button className="back-link" onClick={() => setRcaState('initial')} style={{ marginTop: '1.5rem' }}>Try Again</button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="placeholder-view">
                        <div className="empty-state">
                            <Sparkles size={48} color="var(--color-accent)" />
                            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                            <p>This module is currently being optimized for your workflow.</p>
                        </div>
                    </div>
                )
                }
            </main >
        </div >
    );
}

export default App;
