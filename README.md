# What-If: AI Sci-Fi Inspiration & Outlining Tool

> A full-stack creative tool that transforms real-world tech news into science fiction story seeds using AI.


https://github.com/user-attachments/assets/9f36fa6c-9327-42c2-bdb7-6550932aa29d


## ⚡ Key Features

### AI-Powered Inspiration Engine

**Automated Content Curation**: Leverages GitHub Actions to trigger a daily backend sync, fetching the latest tech news via RSS.

**Intelligent Synthesis**: Integrated with LLM APIs to analyze raw articles and extract "Sci-Fi Seeds"—unique plot hooks and speculative concepts based on real-world emerging tech.

### Frictionless Authentication

**PIN-Code Login**: Replaced traditional email/password complexity with a lightweight PIN verification system, optimizing the user experience for mobile creators and PWA environments.

**Secure Access**: Implemented stateless authentication logic to ensure security without compromising the "instant-access" feel of a creative tool.

### Advanced Interactive UI

**D3.js Data Visualization**: Developed a custom D3.js-powered chart to represent story structure. It provides a bird's-eye view of chapter distribution and narrative weight.

**Draggable Story Outlining**: Built a highly responsive Drag-and-Drop (DnD) interface, allowing writers to reorder story arcs and chapters intuitively, with real-time database synchronization.

## 🏗️ Technical Architecture

```mermaid
graph TD
    %% Client Side
    subgraph Client_Layer [Frontend: React PWA & Android]
        User((User)) --> PWA[React / Vite App]
        PWA --> D3[D3.js Visualization]
    end

    %% GitHub Actions (The Trigger)
    subgraph GitHub_Cloud [GitHub Cloud]
        GA[GitHub Actions] -->|Scheduled Cron POST| CE
    end

    %% Backend Service
    subgraph Railway_Cloud [Railway: Directus & Node.js]
        CE[Custom Endpoint: /rss-worker] -->|Grab| RSS((External RSS))
        CE -->|Analyze| AI[LLM / OpenAI API]
        AI -->|Save| DB[(PostgreSQL)]

        API[Directus REST API] <-->|Fetch News & Outlines| DB
    end

    %% Frontend Interaction
    PWA <-->|Fetch Data| API

    %% Styles
    style Client_Layer fill:#e0eee8,stroke:#6e8b74
    style GitHub_Cloud fill:#fee3d5,stroke:#760001
    style Railway_Cloud fill:#abc3f0,stroke:#2e4e7e
```

## 📈 Technical Stack Summary

LayerTechnologyFrontend : React, Vite, PWA, Capacitor (Android), D3.js

Backend : Directus (Headless CMS), Node.js

Automation : GitHub Actions (Cron Jobs)

AI : OpenAI / LLM Integration

Deployment : Vercel (Frontend), Railway (Backend & PostgreSQL)

## 📱 Installation & Demo

Live Demo: https://whatif42.vercel.app/

Android App: Download the latest APK from the [Releases page](https://github.com/yilizzz/outliner/releases).

<img width="1024" height="1038" alt="what if app" src="https://github.com/user-attachments/assets/0191b910-a452-4011-80f0-17899517fddb" />

