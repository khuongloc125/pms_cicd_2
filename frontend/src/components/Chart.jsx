import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import axios from "axios";
import html2pdf from "html2pdf.js";

// Crosshair plugin
const crosshairPlugin = {
  id: "crosshair",
  defaults: {
    width: 1,
    color: "rgba(0, 0, 0, 0.5)",
    dash: [5, 5],
  },
  afterInit: (chart) => {
    chart.crosshair = {
      x: 0,
      y: 0,
      draw: false,
    };
  },
  afterEvent: (chart, args) => {
    const { inChartArea } = args;
    const { type, x, y } = args.event;

    // Ensure crosshair object exists
    if (!chart.crosshair) {
      chart.crosshair = {
        x: 0,
        y: 0,
        draw: false,
      };
    }

    chart.crosshair = {
      x,
      y,
      draw: inChartArea,
    };

    if (type === "mouseout") {
      chart.crosshair.draw = false;
    }

    chart.draw();
  },
  beforeDatasetsDraw: (chart) => {
    const { ctx } = chart;
    const { top, bottom, left, right } = chart.chartArea;

    // Check if crosshair exists and is enabled
    if (!chart.crosshair || !chart.crosshair.draw) return;

    const { x, y } = chart.crosshair;

    ctx.save();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    ctx.setLineDash([3, 3]);

    // Draw vertical line
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);

    // Draw horizontal line
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);

    ctx.stroke();
    ctx.restore();
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  crosshairPlugin
);

const Chart = forwardRef(({ type = "projects" }, ref) => {
  const [projectData, setProjectData] = useState([]);
  const [memberData, setMemberData] = useState([]);
  const chartRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");

  // Calculate dates for the current month
  const getDateRange = () => {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Calculate months for the current year
  const getMonthRange = () => {
    const months = [];
    const year = new Date().getFullYear();

    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const monthYear = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      months.push(monthYear);
    }
    return months;
  };

  // Fetch data for charts
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === "projects") {
          const projectResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/projects/daily-count`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                userId: userId,
              },
            }
          );
          const dates = getDateRange();
          const projectCounts = dates.map(
            (date) => projectResponse.data[date] || 0
          );
          setProjectData(projectCounts);
        } else if (type === "members") {
          const memberResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/auth/monthly-count`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                userId: userId,
              },
            }
          );
          const months = getMonthRange();
          const memberCounts = months.map((month) => {
            const monthKey =
              month.split(" ")[0].toLowerCase() + "-" + month.split(" ")[1];
            return memberResponse.data[monthKey] || 0;
          });
          setMemberData(memberCounts);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, [accessToken, userId, type]);

  const dates = getDateRange();
  const months = getMonthRange();

  // Project area chart data
  const projectChartData = {
    labels: dates,
    datasets: [
      {
        label: "Projects Created",
        data: projectData.map((value) => value + 0), // Add baseline offset
        backgroundColor: "rgba(0, 216, 25, 0.4)", // Light blue with transparency
        borderColor: "rgba(0, 207, 76, 1)",
        borderWidth: 2,
        fill: "+1", // Fill to the next dataset (baseline)
        tension: 0.3, // Higher tension for more curved, parabolic shape
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "rgba(9, 202, 57, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
      },
      {
        label: "Baseline",
        data: projectData.map(() => 0), // Baseline at 0.2
        backgroundColor: "rgba(255, 206, 84, 0.3)", // Light orange/yellow
        borderColor: "rgba(255, 206, 84, 1)",
        borderWidth: 1,
        fill: "origin", // Fill to origin (0)
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  // Member area chart data
  const memberChartData = {
    labels: months,
    datasets: [
      {
        label: "Members Registered",
        data: memberData.map((value) => value + 0), // Add baseline offset
        backgroundColor: "rgba(54, 162, 235, 0.4)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        fill: "+1", // Fill to the next dataset (baseline)
        tension: 0.3, // Higher tension for more curved, parabolic shape
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Baseline",
        data: memberData.map(() => 0), // Baseline at 0.2
        backgroundColor: "rgba(255, 206, 84, 0.3)",
        borderColor: "rgba(255, 206, 84, 1)",
        borderWidth: 1,
        fill: "origin", // Fill to origin (0)
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: true,
        text: "",
        font: { size: 16 },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        position: "nearest",
        caretSize: 5,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function (context) {
            // Show actual value without the 0.2 offset
            const actualValue = context.parsed.y - 0;
            return `${context.dataset.label}: ${
              actualValue >= 0 ? actualValue : 0
            }`;
          },
        },
      },
      crosshair: {
        width: 1,
        color: "rgba(0, 0, 0, 0.6)",
        dash: [3, 3],
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0, // Start from 0 but data will be offset by 0.2
        title: {
          display: true,
          text: "Count",
          font: { size: 12 },
        },
        ticks: {
          stepSize: 0.5, // Smaller steps to accommodate 0.2 baseline
          precision: 1,
          font: { size: 11 },
          callback: function (value) {
            // Custom tick formatting
            if (value >= 0) return value.toFixed(1);
            return Math.round(value); // Show actual data values
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
      },
      x: {
        title: {
          display: true,
          text: "Time Period",
          font: { size: 12 },
        },
        ticks: {
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
      },
    },
    elements: {
      line: {
        borderJoinStyle: "round",
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    onHover: (event, elements) => {
      // Keep crosshair active on hover
      event.native.target.style.cursor =
        elements.length > 0 ? "crosshair" : "default";
    },
  };

  // Export handler
  const handleExport = () => {
    if (chartRef.current) {
      const chartElement = chartRef.current;
      html2pdf()
        .from(chartElement)
        .set({
          margin: [10, 10, 10, 10],
          filename: `${
            type === "projects" ? "projects_created" : "members_registered"
          }.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
    } else {
      console.error("chartRef is not defined");
    }
  };

  // Expose handleExport to parent via ref
  useImperativeHandle(ref, () => ({
    handleExport,
  }));

  // Render area chart
  return (
    <div className="chart-container" style={{ width: "100%" }}>
      <div className="chart-wrapper" ref={chartRef}>
        <Line
          data={type === "projects" ? projectChartData : memberChartData}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: {
                ...options.plugins.title,
                text:
                  type === "projects"
                    ? "Projects Created"
                    : "Members Registered",
              },
            },
          }}
        />
      </div>
    </div>
  );
});

export default Chart;
