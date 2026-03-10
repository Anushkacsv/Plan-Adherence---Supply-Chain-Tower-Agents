import React, { useEffect, useState } from 'react';
import { ArrowRight, Globe, Shield, Zap, BarChart3, ChevronDown } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
    onExplore: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onExplore }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsVisible(true);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className={`landing-container ${isVisible ? 'fade-in' : ''}`}
            style={{
                '--mouse-x': `${mousePos.x}px`,
                '--mouse-y': `${mousePos.y}px`
            } as React.CSSProperties}
        >
            {/* Background Elements */}
            <div className="bg-glow-1"></div>
            <div className="bg-glow-2"></div>
            <div className="grid-overlay"></div>
            <div className="wave-container">
                <div className="wave wave1"></div>
                <div className="wave wave2"></div>
                <div className="wave wave3"></div>
            </div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-logo">
                    <img src="/logo.png" alt="ABI" className="collab-logo-nav" />
                    <span className="collab-x">×</span>
                    <img src="/ofi_logo.png" alt="OFI" className="collab-logo-nav ofi-logo-nav" />
                    <span className="brand-name">Supply Chain Tower</span>
                </div>
                <div className="nav-links">
                    <span>Solutions</span>
                    <span>Intelligence</span>
                    <span>Security</span>
                    <button className="nav-cta" onClick={onExplore}>Launch Console</button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero">
                <div className="hero-badge">
                    <SparkleIcon />
                    <span>End to End Solution</span>
                </div>


                <h1 className="hero-title">
                    Your <span className="gradient-text">Supply Chain</span> <br />
                    with Absolute Precision
                </h1>

                <p className="hero-description">
                    Real-time visibility, predictive RCA intelligence, and autonomous optimization
                    for the modern global enterprise. Stop reacting, start orchestrating.
                </p>

                <div className="hero-actions">
                    <button className="explore-btn" onClick={onExplore}>
                        Explore
                        <ArrowRight size={20} />
                    </button>
                </div>

                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-value">99.9%</span>
                        <span className="stat-label">Uptime</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-value">250ms</span>
                        <span className="stat-label">Latency</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-value">142</span>
                        <span className="stat-label">Global Hubs</span>
                    </div>
                </div>
            </main>

            {/* Floating Features */}
            <div className="features-ribbon">
                <div className="feature-card">
                    <Globe className="f-icon" />
                    <h3>Global Operations</h3>
                </div>
                <div className="feature-card">
                    <Shield className="f-icon" />
                    <h3>Secure Logistics</h3>
                </div>
                <div className="feature-card">
                    <Zap className="f-icon" />
                    <h3>RCA Intelligence</h3>
                </div>
                <div className="feature-card">
                    <BarChart3 className="f-icon" />
                    <h3>Autonomous Edge</h3>
                </div>
            </div>

            <div className="scroll-indicator">
                <span>Scroll to discover</span>
                <ChevronDown size={16} />
            </div>
        </div>
    );
};

const SparkleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e5b611' }}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);

export default LandingPage;
