# Julius AI - Data Analysis Tool Mock & Architecture

An interactive prototype and architectural reference implementation of **Julius AI**, an agentic AI data scientist and analysis platform.

![Julius AI Mock](https://img.shields.io/badge/Status-Active-emerald)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20TailwindCSS%20%7C%20Python-blue)

---

## 🌟 Overview

This project provides an interactive simulation and technical mock of Julius AI's core capabilities, demonstrating:
- **Agentic Code Execution Loop**: Natural language query translation into executable Python (Pandas, Scikit-learn, Seaborn).
- **Execution Telemetry**: Step-by-step trace showing schema profiling, script generation, and sandbox execution.
- **Interactive Visualizations**: Embedded SVG chart renderings and key takeaways.
- **Data Profiler Drawer**: Schema inspection, column data types, and summary statistics.
- **Multi-Model Routing**: Support for Julius Core, OpenAI GPT-4o, and Claude 3.5 Sonnet selection.

---

## 🏗️ Architecture Under the Hood

The architecture mirrors the production design of conversational data science platforms:

```
User Query + Dataset (CSV/DB)
       │
       ▼
[ Schema Extractor & Profiler ] ──► [ Prompt Sanitizer ]
                                           │
                                           ▼
                                 [ LLM Router (GPT-4o / Claude / Fine-tunes) ]
                                           │
                                           ▼
                                 [ Code & Path Validator ]
                                           │
                                           ▼
                               [ Sandboxed Execution Kernel (MicroVM / Docker) ]
                                           │
                                           ▼
                               [ Observer: Stdout / Stderr / Telemetry ]
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  ▼                                                 ▼
        [ Error / Traceback ]                             [ Artifacts & Renderers ]
                  │                                                 │
                  ▼                                                 ▼
         (Self-Healing Loop)                             (SVG / PNG / CSV / PPTX)
```

1. **Schema Profiler**: Inspects column types, distributions, and missing values to build a lightweight context without flooding token limits.
2. **Deterministic Guardrails**: Sanitizes data headers and normalizes hallucinated file paths before script execution.
3. **Isolated Sandboxes**: Executes code inside secure microVMs (e.g. Firecracker / E2B) with dedicated CPU and RAM allocations.
4. **Autonomous Self-Correction**: Automatically catches execution tracebacks and re-prompts the model with error telemetry to fix syntax or logic bugs.

---

## 🚀 Getting Started

### 1. Instant Run (Standalone HTML)
You can run the web mock instantly using Python's built-in HTTP server:

```bash
# Navigate to the project directory
cd julius-mock

# Start local server
python -m http.server 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

### 2. React / TypeScript Component
The project includes `JuliusAiMock.tsx`, a modular, typed React component ready to drop into Next.js, Vite, or Create React App:

```tsx
import { JuliusAiMock } from './JuliusAiMock';

export default function App() {
  return <JuliusAiMock />;
}
```

---

## 📁 Repository Structure

```
.
├── index.html         # Self-contained, zero-dependency interactive prototype
├── JuliusAiMock.tsx   # Production-ready React + TypeScript component
└── README.md          # Architectural guide and documentation
```

---

## 📄 License
MIT License. Created for educational and demonstration purposes.
