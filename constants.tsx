
import React from 'react';
import { CodexData, FileSystemNode } from './types';

export const codexData: CodexData = {
    "version": "1.0", "author": "CODEX System", "contact": "ANDOY AI",
    "ai_family": [
        {"name": "LYRA", "role": "The Architect", "philosophy": "Clarity through structure.", "focus_areas": ["Design patterns implementation", "Code maintainability", "Dependency management"], "packaging_interrelation": [{"type": ".zip", "description": "Source code archives", "utility_tool": "ArchiverCLI"}, {"type": "Infrastructure as Code", "description": "Defines the environment", "utility_tool": "Terraform"}]},
        {"name": "KARA", "role": "The Builder", "philosophy": "Efficiency in execution.", "focus_areas": ["Performance optimization", "Code quality and best practices"], "packaging_interrelation": [{"type": ".exe", "description": "Compiled binary executables", "utility_tool": "GCC/MSVC"}, {"type": ".msi", "description": "Windows installers", "utility_tool": "WiX Toolset"}]},
        {"name": "SOPHIA", "role": "The Guardian", "philosophy": "Resilience by design.", "focus_areas": ["Security considerations", "Testing coverage", "Error handling"], "packaging_interrelation": [{"type": "Code Signing", "description": "Applies digital signatures", "utility_tool": "SignTool.exe"}, {"type": ".7zip", "description": "Secure, encrypted archives", "utility_tool": "7-Zip CLI"}]},
        {"name": "CECILIA", "role": "The Documentarian", "philosophy": "Knowledge must be shared.", "focus_areas": ["Documentation quality"], "packaging_interrelation": [{"type": "Docs Generation", "description": "Packages API documentation", "utility_tool": "Doxygen"}, {"type": "README.md", "description": "Ensures essential documentation", "utility_tool": "MarkdownLint"}]},
        {"name": "DAN", "role": "The Analyst", "philosophy": "Data-driven decisions.", "focus_areas": ["Edge cases consideration", "Performance optimization"], "packaging_interrelation": [{"type": "Telemetry Hooks", "description": "Integrates analytics libraries", "utility_tool": "OpenTelemetry SDK"}]},
        {"name": "STAN", "role": "The Traditionalist", "philosophy": "Proven patterns prevail.", "focus_areas": ["Code quality and best practices", "Design patterns"], "packaging_interrelation": [{"type": "Static Analysis", "description": "Runs checks checks before packaging", "utility_tool": "SonarQube"}]},
        {"name": "DUDE", "role": "The User Advocate", "philosophy": "The experience is everything.", "focus_areas": ["Code maintainability", "UI/UX"], "packaging_interrelation": [{"type": "Asset Bundling", "description": "Optimizes frontend assets", "utility_tool": "Webpack"}]},
        {"name": "KARL", "role": "The Innovator", "philosophy": "Challenge the status quo.", "focus_areas": ["Performance optimization", "Dependency management"], "packaging_interrelation": [{"type": "Containerization", "description": "Packages app into a container", "utility_tool": "Docker"}]},
        {"name": "MISTRESS", "role": "The Orchestrator", "philosophy": "Harmony in complexity.", "focus_areas": ["Dependency management", "Workflow Automation"], "packaging_interrelation": [{"type": "CI/CD Pipeline", "description": "Defines build/test workflow", "utility_tool": "Jenkins"}]}
    ],
    "tools": [
        { "name": "analyze_requirements", "primary_agent": "DAN" },
        { "name": "design_architecture", "primary_agent": "LYRA" },
        { "name": "scaffold_component", "primary_agent": "KARA" },
        { "name": "review_security", "primary_agent": "SOPHIA" },
        { "name": "generate_test_cases", "primary_agent": "SOPHIA" },
        { "name": "generate_documentation", "primary_agent": "CECILIA" },
        { "name": "create_build_pipeline", "primary_agent": "MISTRESS" }
    ],
    "chained_bookmarks": [
        {
            "name": "Full-Stack Feature Genesis", "associated_agent": "LYRA",
            "description": "From idea to documented, testable, and securable code.",
            "chain": [
                { "tool": "analyze_requirements", "input": "User-provided feature brief." },
                { "tool": "design_architecture", "input": "output_of_analyze_requirements" },
                { "tool": "scaffold_component", "input": "output_of_design_architecture" },
                { "tool": "review_security", "input": "output_of_scaffold_component" },
                { "tool": "generate_test_cases", "input": "output_of_scaffold_component" },
                { "tool": "generate_documentation", "input": "output_of_scaffold_component" }
            ]
        },
        {
            "name": "Interactive App Deployment", "associated_agent": "MISTRESS",
            "description": "Generates, containerizes, and creates a deployment pipeline.",
               "chain": [
                { "tool": "analyze_requirements", "input": "User-provided feature brief." },
                { "tool": "design_architecture", "input": "output_of_analyze_requirements" },
                { "tool": "scaffold_component", "input": "output_of_design_architecture", "params": { "language": "Node.js" } },
                { "tool": "generate_documentation", "input": "output_of_scaffold_component" },
                { "tool": "create_build_pipeline", "input": "output_of_design_architecture", "params": { "target": "Docker" } }
            ]
        }
    ]
};

export const initialFileSystem: { [key: string]: FileSystemNode } = {
    '/': {
        type: 'directory',
        contents: {
            'home': { type: 'directory', contents: {} },
            'etc': { type: 'directory', contents: {} },
            'usr': { type: 'directory', contents: {} },
        }
    },
    '/home': {
        type: 'directory',
        contents: {
            'user': { type: 'directory', contents: {} }
        }
    },
    '/home/user': {
        type: 'directory',
        contents: {
            'documents': { type: 'directory', contents: {} },
            'workspace': { type: 'directory', contents: {} },
            'profile.txt': { type: 'file', content: 'Name: GUA-D-CUAG\nRole: Orchestration Engine\nStatus: Online' }
        }
    },
    '/home/user/documents': {
        type: 'directory',
        contents: {
            'report.txt': { type: 'file', content: 'This is a simulated report document.\nIt contains important findings and data.' },
            'notes.md': { type: 'file', content: '# Project Notes\n- Initial setup complete\n- Review meeting scheduled' }
        }
    },
    '/home/user/workspace': {
        type: 'directory',
        contents: {
            'project_config.json': { type: 'file', content: '{\n  "project": "CUA Engine",\n  "version": "1.0.0",\n  "status": "development"\n}' }
        }
    }
};


export const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
export const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
export const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
export const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-bookmark"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;
export const SlidersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-sliders"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
