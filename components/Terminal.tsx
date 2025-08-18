import React, { useEffect, useRef } from 'react';
import { Terminal as XtermTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { FileSystemNode, Agent, CustomInstructions } from '../types';
import { initialFileSystem, codexData } from '../constants';

interface TerminalProps {
    customInstructions: CustomInstructions;
}

const Terminal: React.FC<TerminalProps> = ({ customInstructions }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<XtermTerminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    
    // Non-state refs to hold mutable data without re-rendering
    const fileSystem = useRef<{[key: string]: FileSystemNode}>(JSON.parse(JSON.stringify(initialFileSystem)));
    const currentDirectory = useRef('/home/user');
    const commandHistory = useRef<string[]>([]);
    const commandIndex = useRef(-1);
    
    // --- File System Helpers ---
    const getNode = (path: string): FileSystemNode | null => {
        const parts = path.split('/').filter(p => p);
        let currentNode: FileSystemNode = fileSystem.current['/'];
        for (const part of parts) {
            if (currentNode.type === 'directory' && currentNode.contents && currentNode.contents[part]) {
                currentNode = currentNode.contents[part];
            } else {
                return null;
            }
        }
        return currentNode;
    };

    const resolvePath = (path: string): string => {
        if (path.startsWith('/')) return path;
        const parts = (currentDirectory.current === '/' ? '' : currentDirectory.current).split('/').concat(path.split('/'));
        const resolved: string[] = [];
        for (const part of parts) {
            if (part === '..') {
                resolved.pop();
            } else if (part && part !== '.') {
                resolved.push(part);
            }
        }
        return '/' + resolved.join('/');
    };
    
    // --- Command Handlers ---
    const handleCliCommand = async (command: string) => {
        const [cmd, ...args] = command.trim().split(/\s+/);
        const termInstance = term.current;
        if (!termInstance) return;

        switch (cmd.toLowerCase()) {
            case 'help':
                termInstance.writeln('\x1b[33mCUA Ecosystem Commands:\x1b[0m');
                termInstance.writeln('  \x1b[32mtask <agent> "<prompt>"\x1b[0m     - Assign a task to an agent.');
                termInstance.writeln('  \x1b[32mstatus\x1b[0m                      - View active Custom Instructions.');
                termInstance.writeln('  \x1b[32mclear\x1b[0m                       - Clear the terminal screen.');
                termInstance.writeln('  \x1b[32mls [path]\x1b[0m                     - List directory contents.');
                termInstance.writeln('  \x1b[32mcat <file>\x1b[0m                    - Display file content.');
                termInstance.writeln('  \x1b[32mcd <directory>\x1b[0m                - Change directory.');
                break;
            case 'clear':
                termInstance.clear();
                break;
            case 'task':
                const agentName = args[0];
                const taskPrompt = command.match(/"(.*?)"/)?.[1];
                if (!agentName || !taskPrompt) {
                     termInstance.writeln('\x1b[31mERROR: Invalid format. Use: task <agent> "<prompt>"\x1b[0m');
                } else {
                    const agent = codexData.ai_family.find(a => a.name.toLowerCase() === agentName.toLowerCase());
                    if (!agent) {
                        termInstance.writeln(`\x1b[31mERROR: Agent '${agentName}' not found.\x1b[0m`);
                    } else {
                         termInstance.writeln(`\x1b[33mSTATUS:\x1b[0m EXECUTING`);
                         await new Promise(r => setTimeout(r, 500));
                         termInstance.writeln(`{\n  "status": "SUCCESS",\n  "agent": "${agent.name}",\n  "response": "Task completed based on philosophy: '${agent.philosophy}'"\n}`);
                    }
                }
                break;
            case 'status':
                termInstance.writeln('\x1b[33mActive Custom Instruction Nuances:\x1b[0m');
                termInstance.writeln(`  \x1b[32mSYSTEM:\x1b[0m ${customInstructions.system || 'Default'}`);
                termInstance.writeln(`  \x1b[32mAI:\x1b[0m     ${customInstructions.ai || 'Default'}`);
                termInstance.writeln(`  \x1b[32mUSER:\x1b[0m   ${customInstructions.user || 'Default'}`);
                break;
            case 'ls':
                 const node = getNode(resolvePath(args[0] || '.'));
                 if (node && node.type === 'directory' && node.contents) {
                    const output = Object.keys(node.contents).map(item => {
                        return node.contents![item].type === 'directory' ? `\x1b[34m${item}/\x1b[0m` : `\x1b[32m${item}\x1b[0m`;
                    }).join('    ');
                    termInstance.writeln(output);
                 } else {
                    termInstance.writeln(`\x1b[31mError: ls: cannot access '${args[0] || '.'}': No such directory\x1b[0m`);
                 }
                break;
            case 'cd':
                const newPath = resolvePath(args[0] || '/home/user');
                const newNode = getNode(newPath);
                if (newNode && newNode.type === 'directory') {
                    currentDirectory.current = newPath === '' ? '/' : newPath;
                } else {
                    termInstance.writeln(`\x1b[31mError: cd: ${args[0]}: Not a directory or does not exist\x1b[0m`);
                }
                break;
             case 'cat':
                const fileNode = getNode(resolvePath(args[0] || ''));
                if (fileNode && fileNode.type === 'file') {
                    termInstance.writeln(fileNode.content || '');
                } else {
                    termInstance.writeln(`\x1b[31mError: cat: ${args[0]}: No such file or is a directory\x1b[0m`);
                }
                break;
            default:
                if(cmd) termInstance.writeln(`\x1b[31mCommand not found: ${cmd}\x1b[0m`);
        }
        prompt();
    };

    const prompt = () => {
        if(term.current) term.current.write(`\r\n\x1b[36mCUAG:${currentDirectory.current}> \x1b[0m`);
    };

    useEffect(() => {
        if (!terminalRef.current || term.current) return;

        const xterm = new XtermTerminal({
            cursorBlink: true, convertEol: true, fontFamily: `'Roboto Mono', monospace`,
            theme: { background: '#000000', foreground: '#00FF00', cursor: 'rgba(0, 255, 0, 0.5)' }
        });
        
        const fAddon = new FitAddon();

        term.current = xterm;
        fitAddon.current = fAddon;

        xterm.loadAddon(fAddon);
        xterm.open(terminalRef.current);
        fAddon.fit();

        xterm.writeln('Welcome to the CUAG Agent CLI. Type \x1b[32mhelp\x1b[0m for commands.');
        prompt();

        let currentCommand = '';
        xterm.onKey(({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.keyCode === 13) { // Enter
                if (currentCommand.trim()) {
                    xterm.writeln('');
                    commandHistory.current.push(currentCommand);
                    commandIndex.current = commandHistory.current.length;
                    handleCliCommand(currentCommand);
                    currentCommand = '';
                } else {
                    prompt();
                }
            } else if (domEvent.keyCode === 8) { // Backspace
                if (xterm.buffer.active.cursorX > `CUAG:${currentDirectory.current}> `.length) {
                    currentCommand = currentCommand.slice(0, -1);
                    xterm.write('\b \b');
                }
            } else if (printable) {
                currentCommand += key;
                xterm.write(key);
            }
        });

        const handleResize = () => {
            fitAddon.current?.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            xterm.dispose();
            term.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="glass neon p-4 h-full flex flex-col">
            <h3 className="text-xl font-bold text-center mb-4 text-white">Agent Command Line Interface (A2A / CUAG)</h3>
            <div id="terminal-container" ref={terminalRef} className="w-full flex-grow bg-black rounded-lg p-2"></div>
        </div>
    );
};

export default Terminal;