import React, { useState } from 'react';
import { FaGithub, FaExternalLinkAlt, FaSearch, FaLayerGroup, FaFolderOpen } from 'react-icons/fa';
import './Portfolio.css';

const PORTFOLIO_PROJECTS = [
  {
    id: 1,
    title: "Card Management REST Service",
    category: "Backend API",
    description: "Enterprise Java microservice built with Spring Boot, OpenFeign clients, and WireMock integration for legacy SOAP-to-REST endpoint migration.",
    tags: ["Java", "Spring Boot", "Microservices", "REST API"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com"
  },
  {
    id: 2,
    title: "E-Commerce Web Portal",
    category: "Web App",
    description: "Full-stack single-page storefront built with React, Context API, and Bootstrap 5, integrated with DummyJSON catalog services.",
    tags: ["React", "Bootstrap 5", "JavaScript", "Context API"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com"
  },
  {
    id: 3,
    title: "Product Catalog Microservice",
    category: "Backend API",
    description: "Node.js & Express API connected to MongoDB Atlas, featuring custom Mongoose regex search filters and pagination logic.",
    tags: ["Node.js", "Express", "MongoDB", "Mongoose"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com"
  },
  {
    id: 4,
    title: "High-Throughput Seat Allocation Engine",
    category: "Enterprise",
    description: "High-performance processing engine written in Java 8 utilizing difference arrays and functional Streams for real-time capacity management.",
    tags: ["Java 8", "Algorithms", "Streams", "Data Structures"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com"
  }
];

const CATEGORIES = ["All", "Web App", "Backend API", "Enterprise"];

function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = PORTFOLIO_PROJECTS.filter((project) => {
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        
        {/* Header Section */}
        <div className="portfolio-header">
          <span className="portfolio-badge">
            <FaFolderOpen /> Case Studies & Work
          </span>
          <h1 className="portfolio-title">Our Project Portfolio</h1>
          <p className="portfolio-subtitle">
            Explore our featured software solutions across enterprise microservices, modern frontends, and RESTful APIs.
          </p>
        </div>

        {/* Filters and Search Bar Toolbar */}
        <div className="portfolio-toolbar">
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-box-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search projects or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="project-card-glass">
                <div className="project-card-body">
                  
                  {/* Category Header Badge */}
                  <div className="project-card-top">
                    <span className="project-category-badge">
                      {project.category}
                    </span>
                    <FaLayerGroup className="layer-icon" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">
                    {project.description}
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="project-tags">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="tech-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="project-card-footer">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-subtle"
                  >
                    <FaGithub /> Source Code
                  </a>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-purple-glow"
                  >
                    <FaExternalLinkAlt size={12} /> Live Demo
                  </a>
                </div>

              </div>
            ))
          ) : (
            <div className="no-projects-found">
              <h5>No projects found matching your search criteria.</h5>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Portfolio;