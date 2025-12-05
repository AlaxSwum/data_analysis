'use client';

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';

interface DashboardData {
  totalPatients: number;
  genderDistribution: Record<string, number>;
  ethnicityDistribution: Record<string, number>;
  ageGroups: Record<string, number>;
  prescriberStats: Record<string, number>;
  surgeryStats: Record<string, number>;
  contactAvailability: {
    homePhone: number;
    mobilePhone: number;
    noContact: number;
  };
}

const COLORS = {
  cyan: '#00d4ff',
  purple: '#a855f7',
  pink: '#ec4899',
  green: '#10b981',
  orange: '#f97316',
  yellow: '#fbbf24',
  blue: '#3b82f6',
  red: '#ef4444',
  teal: '#14b8a6',
  indigo: '#6366f1',
};

const CHART_COLORS = [
  COLORS.cyan, COLORS.purple, COLORS.pink, COLORS.green,
  COLORS.orange, COLORS.yellow, COLORS.blue, COLORS.red,
  COLORS.teal, COLORS.indigo
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen gradient-bg grid-pattern flex items-center justify-center">
        <div className="text-2xl text-white/60 animate-pulse">Loading insights...</div>
      </div>
    );
  }

  // Transform data for charts
  const genderData = Object.entries(data.genderDistribution).map(([name, value]) => ({
    name,
    value,
    fill: name === 'Female' ? COLORS.pink : name === 'Male' ? COLORS.cyan : COLORS.purple
  }));

  const ageData = Object.entries(data.ageGroups).map(([name, value], i) => ({
    name,
    value,
    fill: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const ethnicityData = Object.entries(data.ethnicityDistribution)
    .slice(0, 6)
    .map(([name, value], i) => ({
      name: name.replace('White - ', '').replace('Asian or Asian British - ', ''),
      value,
      fill: CHART_COLORS[i % CHART_COLORS.length]
    }));

  const prescriberData = Object.entries(data.prescriberStats)
    .slice(0, 5)
    .map(([name, value], i) => ({
      name: name.split(',')[0],
      patients: value,
      fill: CHART_COLORS[i % CHART_COLORS.length]
    }));

  const contactData = [
    { name: 'Mobile Phone', value: data.contactAvailability.mobilePhone, fill: COLORS.cyan },
    { name: 'Home Phone', value: data.contactAvailability.homePhone, fill: COLORS.purple },
    { name: 'No Contact', value: data.contactAvailability.noContact, fill: COLORS.pink },
  ];

  const femalePercent = ((data.genderDistribution['Female'] / data.totalPatients) * 100).toFixed(1);
  const malePercent = ((data.genderDistribution['Male'] / data.totalPatients) * 100).toFixed(1);
  const contactRate = (((data.contactAvailability.homePhone + data.contactAvailability.mobilePhone) / data.totalPatients) * 100).toFixed(1);

  return (
    <div className="min-h-screen gradient-bg grid-pattern">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-4 font-medium">
          Healthcare Analytics Report
        </p>
        <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-4">
          Patient Insights
          </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto">
          Comprehensive analysis of {data.totalPatients.toLocaleString()} unique patients
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-sm text-white/60">Data as of December 2025</span>
        </div>
      </header>

      {/* Main Stats */}
      <section className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Patients"
            value={data.totalPatients.toLocaleString()}
            icon=""
            color="cyan"
          />
          <StatCard
            label="Female Patients"
            value={`${femalePercent}%`}
            subvalue={data.genderDistribution['Female'].toLocaleString()}
            icon=""
            color="pink"
          />
          <StatCard
            label="Male Patients"
            value={`${malePercent}%`}
            subvalue={data.genderDistribution['Male'].toLocaleString()}
            icon=""
            color="cyan"
          />
          <StatCard
            label="Contact Rate"
            value={`${contactRate}%`}
            subvalue="Reachable patients"
            icon=""
            color="green"
          />
        </div>
      </section>

      {/* Charts Grid */}
      <section className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gender Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">
              Gender Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: 'rgba(15, 15, 20, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '14px'
                          }}>
                            <p style={{ margin: 0 }}>{payload[0].name}: {payload[0].value?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#fff' }}
                    formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">
              Age Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} layout="vertical">
                  <XAxis type="number" stroke="#ffffff60" tick={{ fill: '#ffffff80' }} />
                  <YAxis dataKey="name" type="category" stroke="#ffffff60" width={50} tick={{ fill: '#ffffff80' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: 'rgba(15, 15, 20, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '14px'
                          }}>
                            <p style={{ margin: 0 }}>Age {payload[0].payload.name}: {payload[0].value?.toLocaleString()} patients</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Prescribers */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">
              Top Prescribers
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prescriberData}>
                  <XAxis dataKey="name" stroke="#ffffff60" tick={{ fill: '#ffffff80', fontSize: 11 }} />
                  <YAxis stroke="#ffffff60" tick={{ fill: '#ffffff80' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: 'rgba(15, 15, 20, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '14px'
                          }}>
                            <p style={{ margin: 0 }}>{payload[0].payload.name}: {payload[0].value?.toLocaleString()} patients</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="patients" radius={[8, 8, 0, 0]}>
                    {prescriberData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contact Availability */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">
              Contact Availability
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contactData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {contactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            background: 'rgba(15, 15, 20, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '14px'
                          }}>
                            <p style={{ margin: 0 }}>{payload[0].name}: {payload[0].value?.toLocaleString()} patients</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Key Insights Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightCard
            icon=""
            title="Aging Population"
            description={`${((data.ageGroups['60-74'] + data.ageGroups['75-99'] + data.ageGroups['100+']) / data.totalPatients * 100).toFixed(0)}% of patients are over 60 years old, indicating significant elderly care needs.`}
            highlight={(data.ageGroups['60-74'] + data.ageGroups['75-99'] + data.ageGroups['100+']).toLocaleString()}
            highlightLabel="patients 60+"
          />
          <InsightCard
            icon=""
            title="Primary Surgery"
            description="Rother House handles 71% of all patients, making it the primary healthcare provider in this dataset."
            highlight="71%"
            highlightLabel="at Rother House"
          />
          <InsightCard
            icon=""
            title="Contact Gap"
            description={`${((data.contactAvailability.noContact / data.totalPatients) * 100).toFixed(0)}% of patients have no contact information on file, a critical communication barrier.`}
            highlight={data.contactAvailability.noContact.toLocaleString()}
            highlightLabel="unreachable"
          />
        </div>
      </section>

      {/* Ethnicity Section */}
      <section className="px-6 py-8 max-w-7xl mx-auto">
        <div className="glass-card p-8">
          <h3 className="text-xl font-semibold mb-6">
            Ethnicity Distribution (Top Categories)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ethnicityData} layout="vertical">
                <XAxis type="number" stroke="#ffffff60" tick={{ fill: '#ffffff80' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#ffffff60" 
                  width={140}
                  tick={{ fill: '#ffffff80', fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          background: 'rgba(15, 15, 20, 0.95)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: '14px'
                        }}>
                          <p style={{ margin: 0 }}>{payload[0].payload.name}: {payload[0].value?.toLocaleString()} patients</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {ethnicityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10">
          <span className="text-white/60">Healthcare Analytics Dashboard</span>
        </div>
        <p className="mt-4 text-white/30 text-sm">
          Data processed from {data.totalPatients.toLocaleString()} patient records
        </p>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  subvalue, 
  icon, 
  color 
}: { 
  label: string; 
  value: string; 
  subvalue?: string; 
  icon: string; 
  color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/30',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
  };

  return (
    <div className={`stat-card glass-card p-6 bg-gradient-to-br ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
      <div className="text-3xl md:text-4xl font-bold mb-1 pulse-number">{value}</div>
      <div className="text-white/50 text-sm">{label}</div>
      {subvalue && <div className="text-white/30 text-xs mt-1">{subvalue}</div>}
    </div>
  );
}

// Insight Card Component
function InsightCard({ 
  icon, 
  title, 
  description, 
  highlight, 
  highlightLabel 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  highlight: string; 
  highlightLabel: string;
}) {
  return (
    <div className="glass-card p-6 hover:bg-white/5 transition-all">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-white/60 text-sm mb-4 leading-relaxed">{description}</p>
      <div className="pt-4 border-t border-white/10">
        <div className="text-2xl font-bold gradient-text">{highlight}</div>
        <div className="text-white/40 text-xs">{highlightLabel}</div>
      </div>
    </div>
  );
}
