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
    AlertTriangle,
    Download,
    Mail,
    Table,
    LayoutDashboard,
    ArrowRight
} from 'lucide-react';
import { SlotAssignmentView } from './components/SlotAssignment/SlotAssignmentView';
import LandingPage from './components/LandingPage';

declare const html2pdf: any;
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
            <div className="kpi-icon-bg" style={{ color: color }}>
                {icon}
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
    const [showLanding, setShowLanding] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    const [rcaState, setRcaState] = useState<'initial' | 'suggesting' | 'loading' | 'response' | 'error'>('initial');
    const [suggestedShipments, setSuggestedShipments] = useState<any[]>([]);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [rcaReport, setRcaReport] = useState<string>('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [allTables, setAllTables] = useState<any>(null);
    const [dashboardKpis, setDashboardKpis] = useState<any>(null);
    const [masterKpis, setMasterKpis] = useState<any>(null);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'rca', label: 'RCA Analysis', icon: <Search size={18} /> },
        { id: 'transport', label: 'Slot Optimizer', icon: <Table size={18} /> },
        { id: 'returns', label: 'Return Logistics', icon: <RotateCcw size={18} /> },
        { id: 'disruption', label: 'Disruption Response', icon: <AlertTriangle size={18} /> },
        { id: 'consolidation', label: 'Load Consolidation', icon: <Layers size={18} /> }
    ];

    // Load suggested shipments from dashboard_data.json
    useEffect(() => {
        fetch('/dashboard_data.json')
            .then(res => res.json())
            .then(data => {
                if (data.shipments) setSuggestedShipments(data.shipments);
                if (data.tables) setAllTables(data.tables);
                if (data.kpis) setDashboardKpis(data.kpis);
                if (data.master_kpis) setMasterKpis(data.master_kpis);
            })
            .catch(err => console.error("Error loading dashboard data:", err));
    }, []);

    const handleRCAReportClick = () => {
        setRcaState('suggesting');
    };

    const DataTableViewer = ({ data }: { data: any }) => {
        if (!data) return null;

        const excludedTabs = ['Slots_Logistics', 'Slots_Master', 'Docks_Master'];
        const availableTabs = Object.keys(data).filter(tab => !excludedTabs.includes(tab));

        const [activeTableTab, setActiveTableTab] = useState(availableTabs[0] || Object.keys(data)[0]);
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
                    {availableTabs.map((tab: any) => (
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

                const generateConfidence = () => parseFloat((0.78 + Math.random() * 0.11).toFixed(3));

                const dummyPool: any = {
                    'Operational': {
                        root_cause: `Detailed investigation of the origin hub's execution logs reveals that the ${delay_hours}-hour delay was primarily driven by a critical synchronization failure between the automated sorting system and manual palletization teams. During the peak 14:00-18:00 dispatch window, the facility experienced a 25% surge in unplanned volume, leading to a 'gridlock' effect at Docks 4 and 7. This operational bottleneck was further exacerbated by a temporary shortage of forklift operators, causing a cascade of missed loading slots for outbound carriers.`,
                        confidence: generateConfidence(),
                        impact: `• Financial Risk Assessment: Immediate accrual of driver detention fees estimated at $150 per hour per vehicle. Prolonged delays may trigger 'Missed Slot' penalties as per the Service Level Agreement (SLA).\n• Downstream Supply Chain: The delay has already disrupted three secondary milk-run routes. Estimated recovery time for the regional distribution network is 18 hours.\n• Inventory Management: A 1.2x slowdown in warehouse inventory turnover has been recorded, potentially leading to stock-out risks at satellite distribution centers in the next 24-hour cycle.`,
                        improvements: `1. Smarter Staff Scheduling: Hire more temporary workers during busy afternoon hours to ensure we have enough people to load trucks without creating a backlog.\n2. Automatic Package Scanning: Use simple cameras at the loading doors to double-check that every package matches the order list, so we don't have to stop and fix mistakes later.\n3. Priority Loading Lanes: Keep two loading doors empty and ready only for urgent shipments, so they don't get stuck behind slower, non-urgent trucks.\n4. Better Driver Communication: Give truck drivers a simple mobile update 30 minutes before their scheduled time so they know exactly which door is ready for them.`
                    },
                    'Weather': {
                        root_cause: `The shipment encountered a severe 'Category 4' precipitation event while transiting the northern corridor, specifically across the high-elevation segment between Kilometer 140 and 280. Real-time telemetry data confirms that low visibility and hydroplaning risks necessitated a safety-mandated speed reduction to 35 km/h (a 45% drop from the planned transit speed). This environmental constraint directly resulted in a ${delay_hours}-hour deviation from the scheduled arrival at the destination hub. There were no reported safety incidents during this transit deviation.`,
                        confidence: generateConfidence(),
                        impact: `• Safety & Compliance Status: 100% adherence to the 'Environmental Safety Protocol' maintained; zero collision or cargo damage risk reported during the storm navigation.\n• Service Reliability: This delay has triggered a 'Force Majeure' clause notification for the client. Proactive rerouting of the follow-up shipment is now required to maintain inventory levels.\n• Logistics Scalability: Regional carrier availability has dropped by 15% due to similar weather-related disruptions across the northern fleet, tightening the spot market capacity.`,
                        improvements: `1. Early Weather Warnings: Use better weather maps to find clear roads at least 12 hours before a storm hits, and automatically tell drivers to take those safer paths.\n2. Winter Time Adjustments: Automatically add an extra hour to planned travel times during the snowy or rainy months (November to February) so we can give clients more realistic delivery dates.\n3. Simple Safety Sensors: Put small, cheap sensors on expensive items to track if they get too wet or bumped during a storm, giving everyone peace of mind.\n4. Automatic Customer Updates: Send a quick text or email to the customer the moment we detect a weather delay, explaining the situation and giving them a new delivery time.`
                    },
                    'Traffic': {
                        root_cause: `The ${delay_hours}-hour arrival delay was caused by extreme port congestion and unplanned road maintenance operations within a 5km radius of the destination terminal. The 'Congestion Index' for this urban segment peaked at 8.7/10, significantly exceeding the historical average of 4.3 for this time window. Carrier telemetry indicates that the vehicle spent over 90 minutes in a 'Zero-Movement' state at the terminal gate due to a failure in the smart-gate RFID verification system, which necessitated manual security clearance for all inbound loads.`,
                        confidence: generateConfidence(),
                        impact: `• Driver Compliance Risk: The extended idling and gate-wait time have pushed the driver close to the maximum 'Hours of Service' (HOS) limit. A mandatory 10-hour rest period is now required, delaying the return leg.\n• Operational Overload: The missed slot has caused a bottleneck at the destination dock, resulting in a 2.5-hour wait time for three subsequent scheduled arrivals.\n• Asset Efficiency: Significant increase in fuel consumption and carbon footprint (estimated 18L wasted) due to prolonged engine idling in the port queue.`,
                        improvements: `1. Night-Time Deliveries: Move deliveries to the late-night hours (10 PM to 4 AM) when roads are empty and the terminal gate has no lines.\n2. Automatic Gate Passes: Use a phone's GPS to automatically book a loading spot as the truck gets close, so the driver doesn't have to wait in line to sign in manually.\n3. Use Backup Warehouses: If the main gate is too busy, allow trucks to drop off packages at smaller nearby warehouses to avoid the port traffic entirely.\n4. Real-Time Traffic Routing: Connect our system to a live traffic app that tells drivers to change their route every 20 minutes if a traffic jam starts forming ahead.`
                    },
                    'Manual Review': {
                        root_cause: `A critical 'Documentation Variance' was flagged during the final checkpoint scan, necessitating a ${delay_hours}-hour manual compliance hold. The issue was traced to an inconsistency between the physical pallet barcodes and the digital manifest generated at the origin warehouse. Specifically, three units of high-priority SKU-902 were missing their secondary compliance stickers, triggering an automated 'Security Halt' in the distribution system. This required a hand-reconciliation of the entire load by the quality assurance (QA) team before the shipment could be released for final-mile delivery.`,
                        confidence: generateConfidence(),
                        impact: `• Audit & Compliance: A 'Major Non-Conformance' has been logged against the origin facility's QA protocol. This may trigger a mandatory site audit if similar incidents recur within the quarter.\n• Human Resource Drain: Engagement of the senior compliance team for 4.5 man-hours to perform manual reconciliation and manifest updates.\n• Data Integrity: The 'Digital Twin' accuracy for this shipment dropped to 0%, necessitating a full system reset for the tracking history to align with the physical load state.`,
                        improvements: `1. Check Before Loading: Make it a rule that the truck cannot leave until every single box is scanned and matched to the order list at the warehouse door.\n2. Simple ID Scanning: Update the handheld scanners at checkpoints to read labels in under 5 seconds, so we don't need people to manually read and type in order numbers.\n3. Shared Digital Records: Use a shared online file where any updates at the warehouse are seen instantly by the security team, so there's never a mismatch in paperwork.\n4. Simple Training Sessions: Give the warehouse staff a quick weekly reminder on how to label boxes correctly to avoid these paperwork mistakes.`
                    }
                };

                const reportData = {
                    rca_class: selectedCat,
                    ...dummyPool[selectedCat]
                };

                setRcaReport(JSON.stringify(reportData));
                setRcaState('response');
            }, 3000);
        }
    };

    const handleDownloadPDF = () => {
        const target = document.querySelector('.rca-response-content') as HTMLElement;
        if (!target || typeof html2pdf === 'undefined') {
            console.error("PDF generator not found or element missing");
            return;
        }

        // Save original styles to revert later
        const originalStyle = target.getAttribute('style') || '';

        // Temporarily force high-contrast print styles
        target.style.background = '#ffffff';
        target.style.color = '#000000';
        target.style.padding = '30px';
        target.style.width = '750px'; // Standard width for A4

        // Find all internal text elements and force them to black
        const textElements = target.querySelectorAll('*');
        const originalTextStyles: string[] = [];
        textElements.forEach((el: any, i) => {
            originalTextStyles[i] = el.getAttribute('style') || '';
            el.style.color = '#000000';
            el.style.opacity = '1';
        });

        const opt = {
            margin: 10,
            filename: `RCA_Report_${selectedShipment?.shipment_id || 'Shipment'}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                scrollY: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(target).set(opt).save().finally(() => {
            // Revert all styles
            target.setAttribute('style', originalStyle);
            textElements.forEach((el: any, i) => {
                el.setAttribute('style', originalTextStyles[i]);
            });
        });
    };

    const handleSendEmail = () => {
        if (!selectedShipment || !rcaReport) return;

        try {
            const data = JSON.parse(rcaReport);

            const subject = `RCA Analysis Report - Shipment #${selectedShipment.shipment_id}`;

            let body = `RCA ANALYSIS REPORT\n`;
            body += `====================\n\n`;
            body += `Shipment ID: #${selectedShipment.shipment_id}\n`;
            body += `Route ID: ${selectedShipment.route_id}\n`;
            body += `Delay Duration: ${(selectedShipment.delay_minutes / 60).toFixed(2)} hours\n\n`;

            body += `RCA CATEGORY: ${data.rca_class}\n`;
            body += `AI CONFIDENCE SCORE: ${(data.confidence * 100).toFixed(1)}%\n\n`;

            body += `ROOT CAUSE INVESTIGATION:\n`;
            body += `${data.root_cause}\n\n`;

            body += `OPERATIONAL IMPACT:\n`;
            body += `${data.impact}\n\n`;

            body += `ADAPTIVE RECOMMENDATIONS:\n`;
            body += `${data.improvements}\n\n`;

            body += `Report generated by Plan Adherence AI Intelligence.`;

            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;

        } catch (error) {
            console.error("Email preparation error:", error);
            alert("Error preparing the email report.");
        }
    };

    const updateSlotData = (newAssignment: any) => {
        // Increase utilization slightly to show live updates
        if (masterKpis) {
            setMasterKpis({
                ...masterKpis,
                util: parseFloat((Math.min(98, (masterKpis.util || 76.8) + 1.2)).toFixed(1))
            });
        }

        // Update Tables to reflect the booking
        if (allTables) {
            const updatedTables = { ...allTables };

            if (updatedTables.Slots) {
                updatedTables.Slots = updatedTables.Slots.map((s: any) =>
                    s.slot_id === newAssignment.slot_id || s.slot_number === newAssignment.slot_number
                        ? { ...s, slot_status: 'Occupied', current_truck: newAssignment.truck_id }
                        : s
                );
            }

            if (updatedTables.Shipments) {
                updatedTables.Shipments = updatedTables.Shipments.map((s: any) =>
                    s.shipment_id === newAssignment.truck_id
                        ? { ...s, shipment_status: 'Slot_Assigned' }
                        : s
                );
            }

            setAllTables(updatedTables);
        }
    };

    if (showLanding) {
        return <LandingPage onExplore={() => setShowLanding(false)} />;
    }

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
                                    color="#8b5cf6"
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
                                    value={`${dashboardKpis?.util || 76.8}%`}
                                    trend={+4.1}
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
                                                <stop offset="0%" stopColor="#f87171" stopOpacity={0.1} />
                                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
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
                                <div className="rca-suggestions animate-in" style={{ width: '100%', maxWidth: '100%' }}>
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
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Significant delays detected across the network</p>
                                                </div>
                                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'var(--color-negative)', color: 'white', padding: '2px 10px', borderRadius: '100px', fontWeight: 800 }}>
                                                    {suggestedShipments.filter(s => s.delay_minutes > 100).length}
                                                </span>
                                            </div>
                                            <div className="shipment-list-grid" style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                                                gap: '1.5rem',
                                                width: '100%'
                                            }}>
                                                {suggestedShipments
                                                    .filter(s => s.delay_minutes > 100)
                                                    .sort((a, b) => b.delay_minutes - a.delay_minutes)
                                                    .slice(0, 12)
                                                    .map((s, idx) => (
                                                        <div key={`flagged-${idx}`} className="shipment-sexy-card" onClick={() => handleShipmentSelect(s)} style={{ margin: 0 }}>
                                                            <div className="id-badge">
                                                                <div className="id-icon-circle">
                                                                    <Truck size={20} />
                                                                </div>
                                                                <div className="shipment-meta-info">
                                                                    <div className="shipment-label-id" style={{ fontSize: '0.9rem', fontWeight: 800 }}>{s.assigned_carrier_id?.replace(/^C\d-R-/, '').replace(/-/g, ' ') || 'Express Cargo'}</div>
                                                                    <div className="shipment-label-route" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                        ID: {s.shipment_id} • {s.route_id}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="delay-tag-sexy">
                                                                <div className="pulse-warning"></div>
                                                                +{(s.delay_minutes / 60).toFixed(2)}h
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
                                    <div className="response-body rca-response-content">
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
                                                                    {data.rca_class}
                                                                </div>
                                                            </div>
                                                            <div className="confidence-meter" style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AI CONFIDENCE SCORE</span>
                                                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-positive)' }}>{(data.confidence * 100).toFixed(1)}%</span>
                                                                </div>
                                                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                                    <div style={{ height: '100%', width: `${data.confidence * 100}%`, background: 'var(--color-positive)', borderRadius: '10px' }}></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="report-section" style={{ marginBottom: '2rem' }}>
                                                            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Activity size={16} /> Root Cause Investigation
                                                            </h3>
                                                            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{data.root_cause}</p>
                                                        </div>

                                                        <div className="report-section" style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <h3 style={{ fontSize: '0.9rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Activity size={16} /> Operational Impact Assessment
                                                            </h3>
                                                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{data.impact}</div>
                                                        </div>

                                                        <div className="report-section">
                                                            <h3 style={{ fontSize: '0.9rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Activity size={16} /> Adaptive Recommendations
                                                            </h3>
                                                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{data.improvements}</div>
                                                        </div>
                                                    </div>
                                                );
                                            } catch (e) {
                                                return <div className="raw-response">{rcaReport}</div>;
                                            }
                                        })()}
                                    </div>
                                    <div className="response-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem', marginTop: '2.5rem', display: 'flex', gap: '1.25rem', justifyContent: 'flex-end' }}>
                                        <button className="btn-sexy btn-sexy-outline" onClick={handleDownloadPDF} style={{ padding: '0.8rem 1.75rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease', border: '1.5px solid rgba(0,0,0,0.06)', background: '#fff', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Download size={18} /> Export PDF
                                        </button>
                                        <button className="btn-sexy btn-sexy-secondary" onClick={handleSendEmail} style={{ padding: '0.8rem 1.75rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease', border: '1.5px solid rgba(229, 182, 17, 0.2)', background: 'rgba(229, 182, 17, 0.08)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Mail size={18} /> Share via Email
                                        </button>
                                        <button className="btn-sexy btn-sexy-primary" onClick={() => setRcaState('suggesting')} style={{ padding: '0.8rem 1.8rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease', border: 'none', background: 'linear-gradient(135deg, #000, #222)', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.2)' }}>
                                            Analyze Another <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {rcaState === 'error' && (
                                <div className="rca-error">
                                    <AlertTriangle size={48} color="var(--color-negative)" />
                                    <p>Connection to analysis service failed.</p>
                                    <button onClick={() => setRcaState('initial')}>Retry</button>
                                </div>
                            )}

                            <button className="back-link" onClick={() => setActiveTab('dashboard')} style={{ marginTop: '2rem' }}>
                                <ChevronLeft size={16} /> Back to Dashboard
                            </button>
                        </div>
                    </div>
                ) : activeTab === 'transport' ? (
                    <SlotAssignmentView
                        masterKpis={masterKpis}
                        allTables={allTables}
                        suggestedShipments={suggestedShipments}
                        onUpdateData={updateSlotData}
                    />
                ) : (
                    <div className="placeholder-view">
                        <div className="empty-state">
                            <Bot size={64} color="var(--color-accent)" />
                            <h2>{navItems.find(i => i.id === activeTab)?.label} Agent</h2>
                            <p>This module is currently being optimized by our AI engineering team.</p>
                            <button className="rca-action-btn" onClick={() => setActiveTab('dashboard')} style={{ marginTop: '2rem', justifyContent: 'center' }}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
