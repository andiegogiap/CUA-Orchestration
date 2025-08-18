import React, { useState, useEffect } from 'react';
import { ChainedBookmark, CustomInstructions } from '../types';
import Loader from './Loader';

interface RightPanelProps {
    isOpen: boolean;
    onClose: () => void;
    customInstructions: CustomInstructions;
    onSetCustomInstructions: (instructions: CustomInstructions) => void;
    savedBookmarks: ChainedBookmark[];
    onSetSavedBookmarks: (bookmarks: ChainedBookmark[]) => void;
    showMessage: (title: string, message: string, isError?: boolean) => void;
}

type RightPanelTab = 'custom-instructions' | 'json-bookmarks' | 'a2a-control' | 'cloud-storage' | 'api-integrations';

const RightPanel: React.FC<RightPanelProps> = ({ isOpen, onClose, customInstructions, onSetCustomInstructions, savedBookmarks, onSetSavedBookmarks, showMessage }) => {
    const [activeTab, setActiveTab] = useState<RightPanelTab>('custom-instructions');
    
    // States for forms
    const [systemInput, setSystemInput] = useState(customInstructions.system);
    const [aiInput, setAiInput] = useState(customInstructions.ai);
    const [userInput, setUserInput] = useState(customInstructions.user);
    const [jsonBookmarkInput, setJsonBookmarkInput] = useState('');
    
    // API Simulation states
    const [a2aResponse, setA2aResponse] = useState('Awaiting response...');
    const [isA2aLoading, setIsA2aLoading] = useState(false);
    const [simDownloadOutput, setSimDownloadOutput] = useState('No content downloaded yet.');

    useEffect(() => {
        setSystemInput(customInstructions.system);
        setAiInput(customInstructions.ai);
        setUserInput(customInstructions.user);
    }, [customInstructions]);

    const handleSetInstructions = (e: React.FormEvent) => {
        e.preventDefault();
        onSetCustomInstructions({ system: systemInput, ai: aiInput, user: userInput });
        showMessage("Instructions Set", "Custom Instructions are now live for this session!");
        onClose();
    };
    
    const addBookmark = () => {
        try {
            const newBookmark = JSON.parse(jsonBookmarkInput);
            if (!newBookmark.name || !newBookmark.chain) {
                showMessage("Invalid Bookmark", "Bookmark JSON must have 'name' and 'chain' properties.", true);
                return;
            }
            onSetSavedBookmarks([...savedBookmarks, newBookmark]);
            setJsonBookmarkInput('');
            showMessage("Bookmark Added", `Custom orchestration "${newBookmark.name}" added successfully!`);
        } catch (e) {
            showMessage("Invalid JSON", "Please enter valid JSON for the bookmark.", true);
        }
    };

    const deleteBookmark = (index: number) => {
        const updatedBookmarks = savedBookmarks.filter((_, i) => i !== index);
        onSetSavedBookmarks(updatedBookmarks);
        showMessage("Bookmark Deleted", "Bookmark removed successfully.");
    };
    
    const sendA2ARequest = async () => {
        setIsA2aLoading(true);
        setA2aResponse("Sending request...");
        await new Promise(r => setTimeout(r, 1500));
        setA2aResponse(JSON.stringify({
            status: "A2A_SUCCESS",
            source_agent: "google@ai-intel.info",
            generated_output: `Simulated response from external AI: Analysis completed.`,
            contextual_nuance: "This response is a simulated output."
        }, null, 2));
        setIsA2aLoading(false);
    };

    const simulateDriveDownload = () => {
        setSimDownloadOutput('{\n  "file_name": "remote_doc.json",\n  "source": "Google Drive (Simulated)",\n  "status": "Ready for A2A consumption"\n}');
        showMessage("Download Simulated", "Simulated download successful.");
    };

    const TabButton: React.FC<{ tabId: RightPanelTab; label: string; }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`tab-btn text-gray-300 py-2 px-4 rounded-t-lg text-sm ${activeTab === tabId ? 'active bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-700/50 border-gray-600'}`}
        >
            {label}
        </button>
    );

    return (
        <div className={`fixed top-0 right-0 h-full w-[630px] max-w-[90vw] transform transition-transform ease-in-out duration-300 z-50 flex flex-col glass neon ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Panel Controls</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
            </div>
            
            <div className="flex justify-center border-b border-gray-700 px-6 pt-4 gap-2">
                <TabButton tabId="custom-instructions" label="Instructions" />
                <TabButton tabId="json-bookmarks" label="Bookmarks" />
                <TabButton tabId="a2a-control" label="A2A Control" />
                <TabButton tabId="cloud-storage" label="Cloud Storage" />
            </div>

            <div className="flex-grow overflow-y-auto p-6">
                {activeTab === 'custom-instructions' && (
                     <form onSubmit={handleSetInstructions}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="system-input" className="block text-sm font-medium text-gray-300 mb-1">SYSTEM Persona</label>
                                <textarea id="system-input" rows={5} value={systemInput} onChange={e => setSystemInput(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" placeholder="e.g., Act as a senior software architect..."></textarea>
                            </div>
                            <div>
                                <label htmlFor="ai-input" className="block text-sm font-medium text-gray-300 mb-1">AI Behavior</label>
                                <textarea id="ai-input" rows={5} value={aiInput} onChange={e => setAiInput(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" placeholder="e.g., Provide concise, code-first answers..."></textarea>
                            </div>
                            <div>
                                <label htmlFor="user-input" className="block text-sm font-medium text-gray-300 mb-1">USER Context</label>
                                <textarea id="user-input" rows={5} value={userInput} onChange={e => setUserInput(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" placeholder="e.g., The current project is a Python Flask API..."></textarea>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button type="submit" className="w-full gemini-btn text-white font-bold py-3 px-6 rounded-lg shadow-lg">Set & Make Instructions Live</button>
                        </div>
                    </form>
                )}
                 {activeTab === 'json-bookmarks' && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Manage Custom Orchestrations</h3>
                        <label htmlFor="json-bookmark-input" className="block text-sm font-medium text-gray-300 mb-1">JSON Bookmark Definition</label>
                        <textarea id="json-bookmark-input" value={jsonBookmarkInput} onChange={e => setJsonBookmarkInput(e.target.value)} rows={8} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white font-mono text-sm" placeholder='Paste JSON here...'></textarea>
                        <div className="flex gap-2 mt-4">
                            <button onClick={addBookmark} className="gemini-btn text-white font-bold py-2 px-4 rounded-lg flex-grow">Add New Bookmark</button>
                        </div>

                        <h4 className="text-lg font-semibold text-white mt-6 mb-3">Saved Orchestrations:</h4>
                        <div className="space-y-3">
                            {savedBookmarks.length === 0 ? (
                                <p className="text-gray-500 text-sm">No custom orchestrations saved yet.</p>
                            ) : (
                                savedBookmarks.map((bookmark, index) => (
                                    <div key={index} className="bg-gray-800 p-3 rounded-md border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-white">{bookmark.name}</p>
                                            <p className="text-xs text-gray-400">{bookmark.description || 'No description'}</p>
                                        </div>
                                        <button onClick={() => deleteBookmark(index)} className="p-1.5 rounded-full hover:bg-red-700 text-white" title="Delete Bookmark">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'a2a-control' && (
                     <div>
                        <h3 className="text-xl font-bold text-white mb-4">Agent-to-Agent Communication</h3>
                        <p className="text-sm text-gray-400 mb-4">Simulate communication with an external AI instance.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Target AI Endpoint URL</label>
                                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" value="https://google@ai-intel.info/api/agent-endpoint" disabled />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">A2A Prompt</label>
                                <textarea rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" placeholder="e.g., Analyze the market trends for Q3."></textarea>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button onClick={sendA2ARequest} className="w-full gemini-btn text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2">
                                {isA2aLoading && <Loader />}
                                <span>Send A2A Request</span>
                            </button>
                        </div>
                        <h4 className="text-lg font-semibold text-white mt-6 mb-3">A2A Response:</h4>
                        <div className="bg-gray-800 p-3 rounded-md border border-gray-700 min-h-[100px] overflow-auto whitespace-pre-wrap font-mono text-sm text-gray-300">
                            {a2aResponse}
                        </div>
                    </div>
                )}
                 {activeTab === 'cloud-storage' && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Cloud Storage (Google Drive)</h3>
                        <p className="text-sm text-gray-400 mb-4">This section simulates interaction with Google Drive. For real file operations, a secure backend service is required.</p>
                        <div className="space-y-4 mb-6">
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Simulated Public Folder ID</label>
                                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" value="your_simulated_folder_id" disabled />
                            </div>
                             <button onClick={() => showMessage('Connected', 'Successfully connected to simulated Google Drive folder.')} className="w-full gemini-btn text-white font-bold py-2 px-4 rounded-lg flex-grow">Simulate Connect</button>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-3">Simulated File Operations:</h4>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">File Name to Simulate Download</label>
                                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" value="remote_doc.json" />
                            </div>
                            <button onClick={simulateDriveDownload} className="w-full gemini-btn text-white font-bold py-3 px-6 rounded-lg shadow-lg">Simulate Download from Drive</button>
                            <h4 className="text-lg font-semibold text-white mt-4">Simulated Download Content:</h4>
                            <div className="bg-gray-800 p-3 rounded-md border border-gray-700 min-h-[80px] overflow-auto whitespace-pre-wrap font-mono text-sm text-gray-300">
                                {simDownloadOutput}
                            </div>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default RightPanel;