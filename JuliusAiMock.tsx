import React, { useState, useRef, useEffect, useId } from 'react';

// --- Type Definitions ---
export interface DatasetColumn {
  name: string;
  type: string;
  sample: string | number;
}

export interface ExecutionTrace {
  step: string;
  durationMs: number;
  status: 'pending' | 'success' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  traces?: ExecutionTrace[];
  codeSnippet?: string;
  chartData?: {
    tier: string;
    churnRate: number;
    accounts: number;
  }[];
  insights?: string[];
  metrics?: { label: string; value: string; sentiment?: 'rose' | 'amber' | 'emerald' }[];
  timestamp: string;
}

// --- Sample Static Dataset ---
const MOCK_COLUMNS: DatasetColumn[] = [
  { name: 'user_id', type: 'int64', sample: '10042' },
  { name: 'signup_date', type: 'datetime64', sample: '2024-01-15' },
  { name: 'plan_tier', type: 'category', sample: 'Starter ($19)' },
  { name: 'monthly_spend', type: 'float64', sample: '49.00' },
  { name: 'login_frequency', type: 'int64', sample: '18 days/mo' },
  { name: 'support_tickets', type: 'int64', sample: '2' },
  { name: 'churned', type: 'bool', sample: '1' },
];

export const JuliusAiMock: React.FC = () => {
  const [model, setModel] = useState<'julius-core' | 'gpt-4o' | 'claude-sonnet'>('julius-core');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [expandedCode, setExpandedCode] = useState<Record<string, boolean>>({ 'initial-msg': true });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'user-0',
      role: 'user',
      content: 'Could you analyze the customer churn rate by subscription tier and generate a visual breakdown with key takeaways?',
      timestamp: '14:32',
    },
    {
      id: 'initial-msg',
      role: 'assistant',
      timestamp: '14:33',
      traces: [
        { step: "Schema profiling: parsed 9 columns, 0 nulls in 'plan_tier' and 'churned'", durationMs: 240, status: 'success' },
        { step: 'Generated Pandas aggregation script & Seaborn barplot code', durationMs: 410, status: 'success' },
        { step: 'Executed in sandbox: exit code 0, 1 figure rendered (SVG)', durationMs: 190, status: 'success' },
      ],
      codeSnippet: `import pandas as pd
import matplotlib.pyplot as plt

# Load dataset from persistent session storage
df = pd.read_csv('customer_churn.csv')

# Calculate churn rates and customer counts by tier
summary = df.groupby('plan_tier').agg(
    total_users=('user_id', 'count'),
    churned_users=('churned', 'sum')
).reset_index()

summary['churn_rate_pct'] = (summary['churned_users'] / summary['total_users']) * 100
print(summary.to_markdown())`,
      chartData: [
        { tier: 'Starter ($19)', churnRate: 24.8, accounts: 2150 },
        { tier: 'Pro ($79)', churnRate: 13.2, accounts: 2200 },
        { tier: 'Enterprise ($299)', churnRate: 4.1, accounts: 650 },
      ],
      insights: [
        'Starter Churn Volatility: Starter tier churn rate is 6.0x higher than Enterprise, pointing to an onboarding drop-off in month 1.',
        'Enterprise Retention: Enterprise contracts maintain a 95.9% retention rate, driven by dedicated CS and SSO integration.',
        'Recommendation: Introduce an onboarding checklist to lower blended churn from 17.0% to ~12.5%.',
      ],
    },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecuting]);

  const toggleCodeBlock = (id: string) => {
    setExpandedCode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRunPrompt = (queryText: string) => {
    if (!queryText.trim() || isExecuting) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: queryText, timestamp: 'Now' },
    ];
    setMessages(newMessages);
    setInputVal('');
    setIsExecuting(true);
    setStatusText("Julius Agent parsing data schema and compiling Python script...");

    // Simulate Agentic sandbox execution steps
    setTimeout(() => {
      setStatusText("Executing script inside isolated MicroVM (E2B Firecracker)...");
    }, 700);

    setTimeout(() => {
      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          timestamp: 'Now',
          traces: [
            { step: 'Parsed features: monthly_spend, login_frequency, support_tickets', durationMs: 190, status: 'success' },
            { step: 'Trained RandomForestClassifier(n_estimators=100)', durationMs: 650, status: 'success' },
            { step: 'Extracted Gini feature importances & ROC-AUC score', durationMs: 220, status: 'success' },
          ],
          codeSnippet: `from sklearn.ensemble import RandomForestClassifier
import numpy as np

features = ['monthly_spend', 'login_frequency', 'support_tickets']
X, y = df[features], df['churned']

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)
importances = dict(zip(features, np.round(model.feature_importances_, 3)))
print("Feature Importances:", importances)`,
          metrics: [
            { label: '#1 Predictor', value: 'Support Tickets (>3)', sentiment: 'rose' },
            { label: '#2 Predictor', value: 'Login Inactivity (<4 d)', sentiment: 'amber' },
            { label: '#3 Predictor', value: 'Monthly Price', sentiment: 'emerald' },
          ],
          insights: [
            'Support Ticket Frequency: Accounts with >3 unresolved support requests in 30 days present an 82% churn probability.',
            'Usage Drop: Login activity dropping below 4 days per month is an early warning indicator 3 weeks ahead of cancellation.',
          ],
        },
      ]);
      setIsExecuting(false);
    }, 1800);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#0f1117] text-slate-200 antialiased font-sans select-none overflow-hidden">
      {/* Top Navigation */}
      <header className="flex h-14 items-center justify-between border-b border-[#1f2430] bg-[#141824] px-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              ⚡
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Julius <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">Data Scientist</span>
            </span>
          </div>

          <div className="mx-2 h-5 w-px bg-[#262c3d]" />

          {/* Model Switcher */}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as any)}
            className="cursor-pointer rounded-lg border border-[#2a3245] bg-[#1a2030] px-3 py-1.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="julius-core">Julius Core (Fine-Tuned Data Model)</option>
            <option value="gpt-4o">OpenAI GPT-4o</option>
            <option value="claude-sonnet">Claude 3.5 Sonnet</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-emerald-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Python 3.11 Sandbox (8 GB RAM)
          </div>

          <button
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-[#2e374f] bg-[#1e2538] px-3 py-1.5 text-slate-300 hover:bg-[#28324a] transition"
          >
            📊 Schema Profiler
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden md:flex w-64 flex-col justify-between border-r border-[#1f2430] bg-[#121622] p-3">
          <div className="space-y-4">
            <button
              onClick={() => setMessages(messages.slice(0, 2))}
              className="flex w-full items-center justify-between rounded-lg border border-[#2b354f] bg-[#1a2133] px-3 py-2 text-xs font-medium text-slate-200 hover:bg-[#232c44] transition"
            >
              <span>+ New Analysis</span>
              <span className="text-[10px] text-slate-400">Ctrl+K</span>
            </button>

            <div>
              <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Attached Dataset
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-[#181e2e] p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between font-medium text-slate-200">
                  <span className="truncate">customer_churn.csv</span>
                  <span className="text-[10px] text-slate-400">2.1 MB</span>
                </div>
                <div className="text-[11px] text-slate-400">5,000 rows • 9 columns</div>
              </div>
            </div>
          </div>

          {/* Sandbox Status */}
          <div className="rounded-lg border border-[#1f2430] bg-[#10141f] p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Sandbox Kernel</span>
              <span className="font-mono text-emerald-400">Active</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#1e2638] overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: '18%' }} />
            </div>
            <div className="text-[10px] text-slate-500">1.4 GB / 8.0 GB used</div>
          </div>
        </aside>

        {/* Conversation Stream */}
        <main className="flex flex-1 flex-col bg-[#0d1017] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-4xl mx-auto flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    ⚡
                  </div>
                )}

                <div className={`space-y-4 ${msg.role === 'user' ? 'max-w-xl' : 'flex-1'}`}>
                  {/* User Bubble */}
                  {msg.role === 'user' && (
                    <div className="rounded-2xl rounded-tr-none border border-[#2c3954] bg-[#1e273c] px-4 py-2.5 text-xs md:text-sm text-slate-100 shadow-sm">
                      {msg.content}
                    </div>
                  )}

                  {/* Assistant Card Content */}
                  {msg.role === 'assistant' && (
                    <>
                      {/* Traces */}
                      {msg.traces && (
                        <div className="rounded-xl border border-[#232c3f] bg-[#141926] p-3 text-xs">
                          <div className="font-medium text-slate-300 flex items-center gap-2 mb-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Agentic Execution Trace ({msg.traces.length} steps)
                          </div>
                          <div className="space-y-1 font-mono text-[11px] text-slate-400">
                            {msg.traces.map((trace, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-emerald-400">
                                <span>✓</span>
                                <span className="text-slate-300">{trace.step}</span>
                                <span className="text-slate-500">({trace.durationMs}ms)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Code Snippet */}
                      {msg.codeSnippet && (
                        <div className="rounded-xl border border-[#232c3f] bg-[#121624] overflow-hidden">
                          <div className="flex items-center justify-between border-b border-[#232c3f] bg-[#171d2d] px-3.5 py-2 text-xs font-medium text-slate-300">
                            <span className="font-mono text-emerald-300">python • sandbox_kernel.py</span>
                            <button
                              onClick={() => toggleCodeBlock(msg.id)}
                              className="text-[11px] text-slate-400 hover:text-white"
                            >
                              {expandedCode[msg.id] ? 'Hide Code' : 'Show Code'}
                            </button>
                          </div>
                          {expandedCode[msg.id] && (
                            <pre className="p-4 text-xs font-mono text-slate-300 bg-[#0f131f] overflow-x-auto leading-relaxed">
                              {msg.codeSnippet}
                            </pre>
                          )}
                        </div>
                      )}

                      {/* Visualization / Chart */}
                      {msg.chartData && (
                        <div className="rounded-xl border border-[#232c3f] bg-[#141926] p-4 space-y-4">
                          <div className="text-sm font-semibold text-white">Churn Rate by Tier (%)</div>
                          <div className="flex justify-around items-end h-44 bg-[#0c0f17] rounded-lg p-4 border border-[#1e2536]">
                            {msg.chartData.map((item, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-300">{item.churnRate}%</span>
                                <div
                                  className="w-16 rounded-t transition-all duration-500"
                                  style={{
                                    height: `${item.churnRate * 4.5}px`,
                                    backgroundColor: idx === 0 ? '#f43f5e' : idx === 1 ? '#38bdf8' : '#10b981',
                                  }}
                                />
                                <span className="text-[11px] text-slate-400">{item.tier}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metrics Cards */}
                      {msg.metrics && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {msg.metrics.map((m, i) => (
                            <div key={i} className="p-3 rounded-lg bg-[#141926] border border-[#232c3f]">
                              <div className="text-[11px] text-slate-400">{m.label}</div>
                              <div className="text-sm font-bold text-white mt-1">{m.value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Insights */}
                      {msg.insights && (
                        <div className="rounded-xl border border-[#232c3f] bg-[#131826] p-4 text-xs text-slate-300 space-y-2">
                          <div className="font-semibold text-white text-sm">💡 Analytical Insights</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {msg.insights.map((insight, idx) => (
                              <li key={idx}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            <div ref={chatBottomRef} />
          </div>

          {/* Running Indicator */}
          {isExecuting && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border-t border-emerald-500/30 px-4 py-2 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Input Box */}
          <div className="border-t border-[#1f2430] bg-[#121624] p-4">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="relative rounded-xl border border-[#2b354d] bg-[#182030] p-2 focus-within:border-emerald-500">
                <textarea
                  id={inputId}
                  rows={2}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleRunPrompt(inputVal);
                    }
                  }}
                  placeholder="Ask Julius to calculate statistics, build ML models, or graph trends..."
                  className="w-full bg-transparent p-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">Active session: customer_churn.csv</span>
                  <button
                    onClick={() => handleRunPrompt(inputVal)}
                    disabled={isExecuting || !inputVal.trim()}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                  >
                    Run Python
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Data Schema Drawer */}
        {drawerOpen && (
          <aside className="w-80 border-l border-[#242c40] bg-[#131724] p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#242c40] pb-3">
                <span className="font-semibold text-white text-sm">Schema Profiler</span>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-2">
                {MOCK_COLUMNS.map((col) => (
                  <div key={col.name} className="flex justify-between rounded bg-[#1a2133] p-2 text-xs">
                    <span className="font-mono text-slate-200">{col.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default JuliusAiMock;
