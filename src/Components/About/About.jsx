import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCode, 
  FaServer, 
  FaDatabase, 
  FaRocket, 
  FaUsers, 
  FaAward, 
  FaLaptopCode,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';
import './About.css';

function About() {
  const skills = [
    { name: 'Java & Spring Boot', icon: FaServer, level: 'Advanced', color: '#c084fc' },
    { name: 'React & Bootstrap', icon: FaCode, level: 'Intermediate', color: '#38bdf8' },
    { name: 'Node.js & Express', icon: FaLaptopCode, level: 'Intermediate', color: '#4ade80' },
    { name: 'SQL & MongoDB', icon: FaDatabase, level: 'Advanced', color: '#facc15' },
  ];

  const stats = [
    { label: 'Years Experience', value: '5+' },
    { label: 'Projects Completed', value: '25+' },
    { label: 'Clients Served', value: '15+' },
    { label: 'Code Commits', value: '1,200+' },
  ];

  return (
    <div className="about-page">
      <div className="about-container">

        {/* Hero Banner Section */}
        <div className="about-hero-grid">
          <div className="hero-content">
            <span className="hero-badge">
              <FaCheckCircle className="badge-icon" /> About Our Company
            </span>
            <h1 className="hero-title">
              Building Robust Solutions with <span className="gradient-text">Modern Tech</span>
            </h1>
            <p className="hero-subtitle">
              We specialize in constructing high-performance web applications, scalable enterprise microservices, and smooth user experiences using cutting-edge frameworks.
            </p>
            <div className="hero-actions">
              <Link to="/contact" className="btn-primary-gradient">
                <span>Work With Us</span>
                <FaArrowRight size={14} />
              </Link>
              <Link to="/portfolio" className="btn-secondary-glass">
                Explore Portfolio
              </Link>
            </div>
          </div>

          <div className="hero-card-side">
            <div className="glass-feature-card">
              <div className="rocket-glow-icon">
                <FaRocket />
              </div>
              <h4>Innovation & Quality</h4>
              <p>
                Delivering production-grade application architecture tailored to enterprise standards.
              </p>
            </div>
          </div>
        </div>

        {/* Key Statistics Bar */}
        <div className="stats-bar-glass">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-item">
              <h2 className="stat-value">{stat.value}</h2>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack & Core Competencies */}
        <div className="about-section">
          <div className="section-header">
            <h2>Technical Expertise</h2>
            <p>Core technologies driving our digital products</p>
          </div>

          <div className="skills-grid">
            {skills.map((skill, idx) => {
              const Icon = skill.icon;
              return (
                <div key={idx} className="skill-card-glass">
                  <div className="skill-icon-badge" style={{ color: skill.color, backgroundColor: `${skill.color}15` }}>
                    <Icon />
                  </div>
                  <h5 className="skill-title">{skill.name}</h5>
                  <span className="skill-level-pill">{skill.level}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Values */}
        <div className="about-section">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <p>The principles guiding every piece of code we write</p>
          </div>

          <div className="values-grid">
            <div className="value-card-glass">
              <div className="value-icon-wrapper purple">
                <FaCode />
              </div>
              <h4>Clean Architecture</h4>
              <p>
                We write modular, testable, and maintainable code built around industry standard software patterns.
              </p>
            </div>

            <div className="value-card-glass">
              <div className="value-icon-wrapper green">
                <FaUsers />
              </div>
              <h4>User-Centric</h4>
              <p>
                Prioritizing seamless interface design, high performance, and accessibility across all screen sizes.
              </p>
            </div>

            <div className="value-card-glass">
              <div className="value-icon-wrapper yellow">
                <FaAward />
              </div>
              <h4>Reliability</h4>
              <p>
                Thorough testing, robust exception handling, and continuous delivery ensure zero downtime software.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;