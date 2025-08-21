import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Agent, ChainedBookmark, ChatMessage, CustomInstructions, Tool } from './types';
import { codexData, BookmarkIcon, CheckIcon, CopyIcon, SpeakerIcon, SlidersIcon } from './constants';
import RightPanel from './components/RightPanel';
import Modal from './components/Modal';
import Loader from './components/Loader';
import AgentCard from './components/AgentCard';
import { generateResponse } from './services/gemini';
import Terminal from './components/Terminal';

type MainTab = 'agentic' | 'adjectic' | 'ajentic';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MainTab>('agentic');
    const [isRightPanelOpen, setRightPanelOpen] = useState(false);
    
    // App-wide State
    const [customInstructions, setCustomInstructions] = useState<CustomInstructions>({ system: '', ai: '', user: '' });
    const [savedBookmarks, setSavedBookmarks] = useState<ChainedBookmark[]>([]);
    const [modalInfo, setModalInfo] = useState<{ title: string; message: string; isError?: boolean; isOpen: boolean }>({ title: '', message: '', isOpen: false });

    // Agentic Tab State
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setChatLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Adjectic Tab State
    const [executingBookmark, setExecutingBookmark] = useState<ChainedBookmark | null>(null);
    const [executionSteps, setExecutionSteps] = useState<string[]>([]);
    
    const userId = useMemo(() => `user_${crypto.randomUUID().slice(0, 8)}`, []);
    const sessionId = useMemo(() => `session_${crypto.randomUUID().slice(0, 12)}`, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('cua_saved_bookmarks');
            if (stored) {
                setSavedBookmarks(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load bookmarks:", e);
        }
    }, []);

    const handleSetSavedBookmarks = (bookmarks: ChainedBookmark[]) => {
        setSavedBookmarks(bookmarks);
        localStorage.setItem('cua_saved_bookmarks', JSON.stringify(bookmarks));
    };

    const showMessage = (title: string, message: string, isError = false) => {
        setModalInfo({ title, message, isError, isOpen: true });
    };

    const handleSelectAgent = (agent: Agent) => {
        setSelectedAgent(agent);
        setChatHistory([]);
        setExecutingBookmark(null);
    };

    const handleStartConversation = useCallback(async () => {
        if (!selectedAgent) return;
        setChatLoading(true);
        const initialPrompt: ChatMessage = {
            role: 'user',
            content: `You are the AI agent ${selectedAgent.name}. Based on your persona ("${selectedAgent.philosophy}"), provide initial workflow suggestions for a new software project as your opening message.`,
            timestamp: Date.now()
        };
        const newHistory = [initialPrompt];
        setChatHistory(newHistory);
        setIsTyping(true);
        const responseText = await generateResponse(newHistory, customInstructions);
        setIsTyping(false);
        setChatHistory(prev => [...prev, { role: 'model', content: responseText, timestamp: Date.now() }]);
        setChatLoading(false);
    }, [selectedAgent, customInstructions]);
    
    const handleSendMessage = useCallback(async (userInput: string) => {
        if (!userInput.trim() || !selectedAgent) return;

        const userMessage: ChatMessage = { role: 'user', content: userInput, timestamp: Date.now() };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setIsTyping(true);
        
        const responseText = await generateResponse(newHistory, customInstructions);
        
        setIsTyping(false);
        setChatHistory(prev => [...prev, { role: 'model', content: responseText, timestamp: Date.now() }]);
    }, [chatHistory, selectedAgent, customInstructions]);

    const handleExecuteBookmark = (bookmark: ChainedBookmark) => {
        setSelectedAgent(null);
        setExecutingBookmark(bookmark);
        setExecutionSteps([]);
        let stepCounter = 0;
        
        const interval = setInterval(() => {
            if (stepCounter < bookmark.chain.length) {
                const step = bookmark.chain[stepCounter];
                const tool = codexData.tools.find(t => t.name === step.tool) as Tool;
                setExecutionSteps(prev => [...prev, `Tool: ${tool.name} (Agent: ${tool.primary_agent})`]);
                stepCounter++;
            } else {
                clearInterval(interval);
            }
        }, 1500);
    };
    
    const applyInlineFormatting = (text: string): string => {
        let formatted = text;
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        return formatted;
    };

    const parseMarkdown = (text: string): string => {
        const lines = text.split('\n');
        let html = '';
        let listType: 'ul' | 'ol' | null = null;
        let inCodeBlock = false;
        let paragraphBuffer: string[] = [];

        const flushParagraph = () => {
            if (paragraphBuffer.length > 0) {
                html += `<p>${applyInlineFormatting(paragraphBuffer.join('<br />'))}</p>`;
                paragraphBuffer = [];
            }
        };

        const flushList = () => {
            if (listType) {
                html += `</${listType}></blockquote>`;
                listType = null;
            }
        };

        for (const line of lines) {
            if (line.trim().startsWith('```')) {
                flushParagraph();
                flushList();
                if (inCodeBlock) {
                    html += '</code></pre>';
                    inCodeBlock = false;
                } else {
                    html += '<pre><code>';
                    inCodeBlock = true;
                }
                continue;
            }

            if (inCodeBlock) {
                html += line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
                continue;
            }
            
            const trimmedLine = line.trim();
            const ulMatch = trimmedLine.match(/^(?:[-*+]\s)(.*)/);
            const olMatch = trimmedLine.match(/^(\d+\.\s)(.*)/);

            if (ulMatch) {
                flushParagraph();
                if (listType !== 'ul') {
                    flushList();
                    listType = 'ul';
                    html += '<blockquote><ul>';
                }
                html += `<li>${applyInlineFormatting(ulMatch[1])}</li>`;
            } else if (olMatch) {
                flushParagraph();
                if (listType !== 'ol') {
                    flushList();
                    listType = 'ol';
                    html += '<blockquote><ol>';
                }
                html += `<li>${applyInlineFormatting(olMatch[2])}</li>`;
            } else if (trimmedLine === '') {
                flushParagraph();
                flushList();
            } else {
                flushList();
                paragraphBuffer.push(line);
            }
        }

        flushParagraph();
        flushList();
        if (inCodeBlock) { // Close unclosed code block
             html += '</code></pre>';
        }

        return html;
    };

    const ChatMessageDisplay: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
        const [copied, setCopied] = useState(false);
        const copyText = (text: string) => {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        };
        const speakText = (text: string) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/[\*#`_~]/g, ''));
            window.speechSynthesis.speak(utterance);
        };
        const isModel = msg.role === 'model';
        return (
             <div className={`message-wrapper flex w-full items-start gap-3 ${!isModel ? 'justify-end' : 'justify-start'}`}>
                {isModel && (
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-blue-400 mt-1">
                        <span className="text-sm font-bold">{selectedAgent?.name.charAt(0)}</span>
                    </div>
                )}
                <div className={`rounded-lg p-3 max-w-xl text-white glass ${isModel ? '' : 'bg-indigo-900/30'}`}>
                    <div className="prose-like" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                </div>
                {isModel && (
                    <div className="flex flex-col gap-2 pt-1">
                        <button onClick={() => speakText(msg.content)} className="p-1.5 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white" title="Read aloud"><SpeakerIcon /></button>
                        <button onClick={() => copyText(msg.content)} className="p-1.5 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white" title="Copy text">{copied ? <CheckIcon/> : <CopyIcon />}</button>
                    </div>
                )}
            </div>
        );
    };

    const ChatInterface: React.FC = () => {
        const [input, setInput] = useState('');
        const chatLogRef = React.useRef<HTMLDivElement>(null);

        useEffect(() => {
           chatLogRef.current?.scrollTo(0, chatLogRef.current.scrollHeight);
        }, [chatHistory, isTyping]);
        
        const onSend = (e: React.FormEvent) => {
            e.preventDefault();
            handleSendMessage(input);
            setInput('');
        };
        
        return (
            <div className="mt-6">
                <div ref={chatLogRef} className="h-[500px] overflow-y-auto space-y-4 mb-4 pr-4">
                    {chatHistory.map(msg => <ChatMessageDisplay key={msg.timestamp} msg={msg} />)}
                    {isTyping && <div className="flex justify-start"><div className="glass rounded-lg p-3 typing-indicator"><span></span><span></span><span></span></div></div>}
                </div>
                <form onSubmit={onSend} className="flex gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-grow bg-gray-900/40 backdrop-blur-sm border border-gray-500/50 rounded-lg p-3 text-white" placeholder="Ask a follow-up..." required autoComplete="off" />
                    <button type="submit" disabled={isTyping} className="gemini-btn font-bold p-3 rounded-lg flex items-center justify-center w-24">
                        {isTyping ? <Loader /> : 'Send'}
                    </button>
                </form>
            </div>
        );
    };

    const AgentDetailPanel: React.FC<{ agent: Agent }> = ({ agent }) => (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto border-2 border-blue-400"><span className="text-4xl font-bold">{agent.name.charAt(0)}</span></div>
                <h2 className="text-2xl font-bold mt-2 text-white">{agent.name}</h2><p className="text-blue-300">{agent.role}</p>
            </div>
            <div className="flex-grow">
                <p className="italic text-gray-300 border-l-4 border-blue-400 pl-4">"{agent.philosophy}"</p>
                <h4 className="text-lg font-semibold mt-4 mb-2 text-white">Focus Areas:</h4>
                <div className="flex flex-wrap gap-2">{agent.focus_areas.map(area => <span key={area} className="bg-gray-600 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{area}</span>)}</div>
            </div>
        </div>
    );

    const TabButton: React.FC<{ tabId: MainTab, label: string }> = ({ tabId, label }) => (
        <button onClick={() => setActiveTab(tabId)} className={`py-2 px-6 rounded-t-lg transition-colors duration-200 ${activeTab === tabId ? 'bg-indigo-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/70'}`}>{label}</button>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 relative">
            <Modal {...modalInfo} onClose={() => setModalInfo(prev => ({ ...prev, isOpen: false }))} />
            <RightPanel isOpen={isRightPanelOpen} onClose={() => setRightPanelOpen(false)} customInstructions={customInstructions} onSetCustomInstructions={setCustomInstructions} savedBookmarks={savedBookmarks} onSetSavedBookmarks={handleSetSavedBookmarks} showMessage={showMessage} />
            
            <button onClick={() => setRightPanelOpen(true)} className="fixed top-4 right-4 z-40 p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                <SlidersIcon />
            </button>

            <header className="text-center mb-8">
                <a href="/" aria-label="Home" className="inline-block mb-4">
                  <img
                    src="https://andiegogiap.com/assets/aionex-icon-256.png"
                    alt="AIONEX"
                    width={128}
                    height={128}
                    style={{height: '40px', width: 'auto'}}
                    loading="eager"
                    decoding="async"
                  />
                </a>
                <h1 className="text-4xl md:text-5xl font-bold text-white">CUA Orchestration Engine</h1>
                <p className="text-lg text-gray-400 mt-2">Persona: GUA-D-CUAG</p>
                <p className="text-sm text-gray-500 mt-1">System USER: <span className="font-mono">{userId}</span> | Session ID: <span className="font-mono">{sessionId}</span></p>
            </header>

            <div className="mb-8 border-b border-gray-700 flex justify-center">
                <TabButton tabId="agentic" label="AGENTIC CORE" />
                <TabButton tabId="adjectic" label="ADJECTIC MANIFEST" />
                <TabButton tabId="ajentic" label="AJENTIC NEXUS" />
            </div>

            <main>
                {activeTab === 'agentic' && (
                    <div>
                         <h2 className="text-2xl font-bold text-white mb-4 text-center">AI Family Agents</h2>
                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                            {codexData.ai_family.map(agent => (
                                <AgentCard key={agent.name} title={agent.name} subtitle={agent.role} onClick={() => handleSelectAgent(agent)} isSelected={selectedAgent?.name === agent.name} />
                            ))}
                         </div>
                         <div className="glass neon p-6">
                             {!selectedAgent ? (
                                 <div className="text-center py-10">
                                     <h2 className="text-2xl font-bold text-white mb-2">Select an Agent</h2>
                                     <p className="text-gray-300">Choose an AI Family member to view their profile and start a conversation.</p>
                                 </div>
                             ) : (
                                <>
                                    <AgentDetailPanel agent={selectedAgent} />
                                    {chatHistory.length === 0 ? (
                                        <div className="mt-6 text-center">
                                            <button onClick={handleStartConversation} disabled={isChatLoading} className="gemini-btn text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center mx-auto w-72">
                                                {isChatLoading ? <Loader/> : `✨ Start Conversation with ${selectedAgent.name}`}
                                            </button>
                                        </div>
                                    ) : (
                                        <ChatInterface />
                                    )}
                                </>
                             )}
                         </div>
                    </div>
                )}
                {activeTab === 'adjectic' && (
                     <div>
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Available Orchestrations & Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                           {codexData.chained_bookmarks.map(bm => (
                               <AgentCard key={bm.name} title={bm.name} subtitle={bm.description} onClick={() => handleExecuteBookmark(bm)} isSelected={executingBookmark?.name === bm.name} type="orchestration" />
                           ))}
                           <AgentCard title="Create Custom Instruction" subtitle="Define personas for this session" onClick={() => { setRightPanelOpen(true); }} isSelected={false} type="action" />
                        </div>
                        {executingBookmark && (
                             <div className="glass neon p-6">
                                <h2 className="text-3xl font-bold text-center mb-4 text-white">Executing: {executingBookmark.name}</h2>
                                <div className="space-y-4">
                                    {executionSteps.map((step, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">{i + 1}</span>
                                            <h4 className="text-lg font-bold text-white font-mono">{step}</h4>
                                            {i === executionSteps.length - 1 && i < executingBookmark.chain.length -1 && <div className="ml-auto"><Loader/></div> }
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'ajentic' && (
                    <div className="h-[600px]">
                        <Terminal customInstructions={customInstructions} />
                    </div>
                )}
            </main>

            <footer className="text-center text-xs text-gray-600 p-4 font-mono mt-8">
                GUA-D-CUAG | ECOSYSTEM PRIMER: A3 | SIMULATION NETWORK: 255.8.8.8
            </footer>
        </div>
    );
};

export default App;