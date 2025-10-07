// @ts-nocheck
// Ignoring TS as this is mainly for demo/styling purposes
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "./auth";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const user = useUser();
  const [colors, setColors] = useState({});
  const colorRef = useRef();

  const updateColors = () => {
    if (colorRef.current) {
      const primaryColor = window.getComputedStyle(
        colorRef.current.querySelector(".primary")
      ).backgroundColor;
      const baseContentColor = window.getComputedStyle(
        colorRef.current.querySelector(".base-content")
      ).backgroundColor;
      const baseColor = window.getComputedStyle(
        colorRef.current.querySelector(".base")
      ).backgroundColor;
      setColors({ primaryColor, baseContentColor, baseColor });
    }
  };

  useEffect(() => {
    updateColors();

    const observer = new MutationObserver(() => {
      updateColors();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="p-6 bg-base-100 min-h-screen">
      {/* Hidden elements to fetch colors */}
      <div ref={colorRef} className="hidden">
        <div className="primary bg-primary"></div>
        <div className="base-content bg-base-content"></div>
        <div className="base bg-base"></div>
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="avatar placeholder online">
            <div className="bg-primary text-primary-content rounded-full w-16">
              <span className="text-3xl font-bold">
                {user.display[0].toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-base-content">
              Hello, {user.display}
            </h1>
            <p className="text-base-content/70 text-lg">
              Welcome! Owning a home is a lot of work. We're here to help.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base-content/70 text-sm mb-2">Homedex Score™</p>
          <div className="flex items-center justify-end">
            <div
              className="radial-progress text-primary"
              style={{ "--value": 91, "--size": "5rem", "--thickness": "6px" }}
              role="progressbar"
            >
              <span className="text-3xl font-extrabold">91</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Home Value",
            value: "$450,000",
            icon: CurrencyDollarIcon,
            change: 5.2,
            isPositive: true,
          },
          {
            title: "Active Tasks",
            value: "12",
            icon: WrenchScrewdriverIcon,
            change: 5,
            isPositive: false,
          },
          {
            title: "Completed Tasks",
            value: "5",
            icon: CheckCircleIcon,
            change: 10,
            isPositive: true,
          },
          {
            title: "Upcoming Bills",
            value: "3",
            icon: CreditCardIcon,
            change: 2,
            isPositive: true,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-base-100 p-6 rounded-box border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base-content/70 text-sm mb-1">
                  {stat.title}
                </p>
                <h3 className="text-xl font-extrabold text-base-content">
                  {stat.value}
                </h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-box">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div
              className={`flex items-center mt-4 ${
                stat.isPositive ? "text-success" : "text-error"
              }`}
            >
              {stat.isPositive ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              <span className="font-bold">{stat.change}%</span>
              <span className="text-base-content/70 ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-base-100 p-6 rounded-box border border-gray-200">
          <h2 className="text-2xl font-extrabold mb-6 text-base-content">
            Home Value Appreciation
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={[
                { name: "2020", value: 350000 },
                { name: "2021", value: 375000 },
                { name: "2022", value: 425000 },
                { name: "2023", value: 450000 },
                { name: "2024", value: 460000 },
              ]}
            >
              <XAxis
                dataKey="name"
                stroke={colors.baseContentColor || "gray"}
                tick={{ fill: colors.baseContentColor || "gray" }}
              />
              <YAxis
                stroke={colors.baseContentColor || "gray"}
                tick={{ fill: colors.baseContentColor || "gray" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.baseColor || "white",
                  border: "none",
                  borderRadius: "var(--rounded-box)",
                }}
                itemStyle={{ color: colors.baseContentColor || "gray" }}
                labelStyle={{ color: colors.baseContentColor || "gray" }}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.primaryColor || "blue"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.primaryColor || "blue"}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.primaryColor || "blue"}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-base-100 p-6 rounded-box border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-base-content">
              Energy Consumption (kWh)
            </h2>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
              <p className="text-sm text-base-content/70">
                Last Synced with Nest: 22 min ago
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { name: "Jan", value: 1200 },
                { name: "Feb", value: 1100 },
                { name: "Mar", value: 1000 },
                { name: "Apr", value: 900 },
                { name: "May", value: 800 },
                { name: "Jun", value: 700 },
                { name: "Jul", value: 650 },
              ]}
            >
              <XAxis
                dataKey="name"
                stroke={colors.baseContentColor || "gray"}
                tick={{ fill: colors.baseContentColor || "gray" }}
              />
              <YAxis
                stroke={colors.baseContentColor || "gray"}
                tick={{ fill: colors.baseContentColor || "gray" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.baseColor || "white",
                  border: "none",
                  borderRadius: "var(--rounded-box)",
                }}
                itemStyle={{ color: colors.baseContentColor || "gray" }}
                labelStyle={{ color: colors.baseContentColor || "gray" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.primaryColor || "blue"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-base-100 p-6 rounded-box border border-gray-200">
          <h2 className="text-2xl font-extrabold mb-6 text-base-content">
            Recent Maintenance
          </h2>
          <div className="space-y-4">
            {[
              {
                name: "HVAC Tune-up",
                amount: "$150",
                date: "2025-07-15",
                status: "completed",
              },
              {
                name: "Gutter Cleaning",
                amount: "$75",
                date: "2025-07-10",
                status: "completed",
              },
              {
                name: "Leaky Faucet Repair",
                amount: "$200",
                date: "2025-07-05",
                status: "pending",
              },
            ].map((transaction, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-base-100 rounded-box"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      transaction.status === "completed"
                        ? "bg-success"
                        : "bg-warning"
                    }`}
                  ></div>
                  <div>
                    <p className="font-bold text-base-content">
                      {transaction.name}
                    </p>
                    <p className="text-sm text-base-content/70">
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-base-content">
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-base-100 p-6 rounded-box border border-gray-200">
          <h2 className="text-2xl font-extrabold mb-6 text-base-content">
            Expense Breakdown
          </h2>
          <div className="space-y-6">
            {[
              { name: "Mortgage", sales: 1800, percentage: 60 },
              { name: "Utilities", sales: 450, percentage: 15 },
              { name: "Taxes", sales: 300, percentage: 10 },
              { name: "Insurance", sales: 150, percentage: 5 },
              { name: "Maintenance", sales: 300, percentage: 10 },
            ].map((product, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-base-content">{product.name}</p>
                  <p className="text-sm font-bold text-base-content/70">
                    ${product.sales} amount
                  </p>
                </div>
                <div className="w-full bg-base-300 rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full text-xs font-bold text-primary-content text-center leading-4"
                    style={{ width: `${product.percentage}%` }}
                  >
                    {product.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
