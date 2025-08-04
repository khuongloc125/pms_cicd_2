import React from "react";
import { BarChart, List, Layout, Clock, FileText, Users } from "lucide-react";
import "../styles/user/tabs.css"; // Ensure this import points to the correct CSS file

const ProjectTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "summary", label: "Summary", icon: BarChart },
    { id: "backlog", label: "Backlog", icon: List },
    { id: "board", label: "Board", icon: Layout },
    { id: "timeline", label: "Time Line", icon: Clock },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "people", label: "Members", icon: Users },
  ];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab ${activeTab === tab.id ? "active" : ""}`}
          id={tab.id}
        >
          <tab.icon className="tab-icon" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
