import React from 'react';
import { Truck, Sparkles, Layers, Activity, Clock, Bot, ArrowUpRight, ArrowDownRight, CheckCircle2, Zap, Loader2 } from 'lucide-react';

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

interface SlotAssignmentViewProps {
    masterKpis: any;
    allTables: any;
    suggestedShipments: any[];
}

export const SlotAssignmentView: React.FC<SlotAssignmentViewProps> = ({
    masterKpis,
    allTables,
    suggestedShipments
}) => {
    const [requests, setRequests] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [bookedId, setBookedId] = React.useState<string | null>(null);

    const [bookingInProgress, setBookingInProgress] = React.useState<string | null>(null);

    const handleBookSlot = async (req: any) => {
        setBookingInProgress(req.truck_id);

        try {
            // Mapping details to query parameters for the GET request
            const params = new URLSearchParams({
                truck_id: req.truck_id,
                warehouse: req.warehouse,
                cargo_type: req.cargo_type,
                operation: req.operation,
                preferred_time: req.preferred_time,
                truck_size: req.truck_size,
                status: 'Optimisation_Requested',
                timestamp: new Date().toISOString()
            });

            const N8N_URL = `http://localhost:5678/webhook-test/f368d3f3-4717-4204-98aa-ed4dccc61e6e?${params.toString()}`;

            console.log(`Triggering n8n webhook: ${req.truck_id}`);

            const response = await fetch(N8N_URL, {
                method: 'GET',
                mode: 'cors'
            });

            if (response.ok) {
                setBookedId(req.truck_id);
                setTimeout(() => {
                    setBookedId(null);
                }, 3000);
            } else {
                console.warn("n8n Webhook returned an error:", response.status);
                // Fallback for visual demo if webhook fails
                setBookedId(req.truck_id);
                setTimeout(() => setBookedId(null), 3000);
            }
        } catch (error) {
            console.error("Failed to connect to n8n:", error);
            // Fallback for visual demo
            setBookedId(req.truck_id);
            setTimeout(() => setBookedId(null), 3000);
        } finally {
            setBookingInProgress(null);
        }
    };

    const handleCheckRequests = () => {
        setIsLoading(true);

        // Simulating a network call and generating 10 random requests from master data
        setTimeout(() => {
            const whIds = allTables?.Warehouses?.map((w: any) => w.warehouse_id) || ["WH-SIL-01", "WH-RAN-01"];
            const cargoTypes = ["Electronics", "Perishables", "Industrial", "Apparel", "Consumer Goods", "Pharma", "Automotive"];
            const sizes = ["Small", "Medium", "Large"];
            const operations = ["Loading", "Unloading"];

            const newRequests = Array.from({ length: 10 }).map((_, i) => {
                const startHour = 8 + Math.floor(Math.random() * 12);
                const endHour = startHour + 1 + Math.floor(Math.random() * 2);
                const timeSlot = `${String(startHour).padStart(2, '0')}:00 - ${String(Math.min(endHour, 22)).padStart(2, '0')}:00`;

                return {
                    "truck_id": `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
                    "warehouse": whIds[Math.floor(Math.random() * whIds.length)],
                    "cargo_type": cargoTypes[Math.floor(Math.random() * cargoTypes.length)],
                    "operation": operations[Math.floor(Math.random() * operations.length)],
                    "preferred_time": timeSlot,
                    "truck_size": sizes[Math.floor(Math.random() * sizes.length)]
                };
            });

            setRequests(newRequests);
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="transport-view animate-in">
            <div className="kpi-grid">
                <KPICard
                    index={1}
                    title="Total Incoming Trucks"
                    value={suggestedShipments.length.toLocaleString()}
                    trend={+2.4}
                    icon={<Truck size={24} />}
                    color="#06b6d4"
                />
                <KPICard
                    index={2}
                    title="Optimized Slots %"
                    value={masterKpis?.util !== undefined ? `${masterKpis.util}%` : "0%"}
                    trend={1.2}
                    icon={<Sparkles size={24} />}
                    color="#e5b611"
                />
                <KPICard
                    index={3}
                    title="Active Docks"
                    value={allTables?.Docks_Master?.filter((d: any) => d.dock_status === 'Active').length || 0}
                    trend={0}
                    icon={<Layers size={24} />}
                    color="#3b82f6"
                />
                <KPICard
                    index={4}
                    title="Dock Utilization"
                    value={`${masterKpis?.util || 0}%`}
                    trend={+1.2}
                    icon={<Activity size={24} />}
                    color="#10b981"
                />
                <KPICard
                    index={5}
                    title="Average Wait Time"
                    value={Math.round(allTables?.Slots_Master?.reduce((acc: number, s: any) => acc + (s.waiting_time_minutes || 0), 0) / (allTables?.Slots_Master?.length || 1))}
                    trend={-5.3}
                    icon={<Clock size={24} />}
                    color="#f97316"
                />
            </div>

            <div className="chart-card" style={{ marginTop: '1rem' }}>
                <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="chart-title">Slot Optimizer Overview</h2>
                        <p className="chart-subtitle">Real-time dock scheduling and truck queue management</p>
                    </div>
                    <button
                        className={`btn-fancy ${isLoading ? 'loading' : ''}`}
                        onClick={handleCheckRequests}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <div className="btn-content">
                                <Zap size={18} className="pulse-icon" />
                                <span>Assign Slots</span>
                            </div>
                        )}
                        <div className="btn-glow"></div>
                    </button>
                </div>

                <div className="slot-telemetry-container">
                    {requests.length === 0 ? (
                        <div className="empty-telemetry">
                            <Bot size={48} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Slot Allocation Engine is Active</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Waiting for incoming truck telemetry...</p>
                        </div>
                    ) : (
                        <div className="booking-requests-grid">
                            {requests.map((req, idx) => (
                                <div key={idx} className="request-card animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="request-card-header">
                                        <div className="truck-tag">
                                            <Truck size={16} />
                                            <span>{req.truck_id}</span>
                                        </div>
                                        <span className="wh-tag">{req.warehouse}</span>
                                    </div>
                                    <div className="request-details">
                                        <div className="detail-item">
                                            <label>Cargo Type</label>
                                            <span>{req.cargo_type}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Operation</label>
                                            <span className="operation-badge">{req.operation}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Time Slot</label>
                                            <span>{req.preferred_time}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Truck Size</label>
                                            <span>{req.truck_size}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`book-slot-btn ${bookedId === req.truck_id ? 'booked' : ''} ${bookingInProgress === req.truck_id ? 'loading' : ''}`}
                                        onClick={() => handleBookSlot(req)}
                                        disabled={bookedId === req.truck_id || bookingInProgress === req.truck_id}
                                    >
                                        {bookingInProgress === req.truck_id ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : bookedId === req.truck_id ? (
                                            <CheckCircle2 size={16} />
                                        ) : (
                                            <Sparkles size={16} />
                                        )}
                                        <span>
                                            {bookingInProgress === req.truck_id ? 'Optimising...' :
                                                bookedId === req.truck_id ? 'Booked!' : 'Book Optimised slot'}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
