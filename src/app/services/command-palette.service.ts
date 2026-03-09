import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
  shortcut?: string;
  category: string;
  action: string;
  keywords: string[];
}

const SEED_COMMANDS: Command[] = [
  { id: 'cmd1', label: 'Go to Dashboard', description: 'Navigate to dashboard', icon: 'home', shortcut: 'g d', category: 'navigation', action: 'navigate:/dashboard', keywords: ['home', 'main'] },
  { id: 'cmd2', label: 'Go to Tickets', description: 'Navigate to tickets list', icon: 'ticket', shortcut: 'g t', category: 'navigation', action: 'navigate:/tickets', keywords: ['issues', 'support'] },
  { id: 'cmd3', label: 'Go to Customers', description: 'Navigate to customers', icon: 'users', shortcut: 'g c', category: 'navigation', action: 'navigate:/customers', keywords: ['clients', 'contacts'] },
  { id: 'cmd4', label: 'Go to Invoices', description: 'Navigate to invoices', icon: 'invoice', shortcut: 'g i', category: 'navigation', action: 'navigate:/invoices', keywords: ['billing', 'payments'] },
  { id: 'cmd5', label: 'Go to Items', description: 'Navigate to items', icon: 'box', shortcut: 'g p', category: 'navigation', action: 'navigate:/items', keywords: ['products', 'catalog'] },
  { id: 'cmd6', label: 'Go to Reports', description: 'Navigate to reports', icon: 'chart', shortcut: 'g r', category: 'navigation', action: 'navigate:/reports', keywords: ['analytics'] },
  { id: 'cmd7', label: 'Create Ticket', description: 'Create a new ticket', icon: 'plus', shortcut: 'c t', category: 'actions', action: 'create:ticket', keywords: ['new', 'add', 'issue'] },
  { id: 'cmd8', label: 'Create Customer', description: 'Create a new customer', icon: 'user-plus', shortcut: 'c c', category: 'actions', action: 'create:customer', keywords: ['new', 'add', 'client'] },
  { id: 'cmd9', label: 'Create Invoice', description: 'Create a new invoice', icon: 'file-plus', shortcut: 'c i', category: 'actions', action: 'create:invoice', keywords: ['new', 'bill'] },
  { id: 'cmd10', label: 'Create Item', description: 'Create a new item', icon: 'box-plus', shortcut: 'c p', category: 'actions', action: 'create:item', keywords: ['new', 'product'] },
  { id: 'cmd11', label: 'Export Data', description: 'Export current view data', icon: 'download', category: 'actions', action: 'export:data', keywords: ['download', 'csv', 'excel'] },
  { id: 'cmd12', label: 'Import Data', description: 'Import data from file', icon: 'upload', category: 'actions', action: 'import:data', keywords: ['upload', 'csv'] },
  { id: 'cmd13', label: 'Open Settings', description: 'Open application settings', icon: 'gear', shortcut: ',', category: 'settings', action: 'navigate:/settings', keywords: ['preferences', 'config'] },
  { id: 'cmd14', label: 'Toggle Theme', description: 'Switch between light and dark mode', icon: 'moon', category: 'settings', action: 'toggle:theme', keywords: ['dark', 'light', 'mode'] },
  { id: 'cmd15', label: 'Manage Users', description: 'Manage team members', icon: 'users-gear', category: 'settings', action: 'navigate:/settings/users', keywords: ['team', 'members', 'permissions'] },
  { id: 'cmd16', label: 'API Keys', description: 'Manage API keys', icon: 'key', category: 'settings', action: 'navigate:/settings/api', keywords: ['tokens', 'integration'] },
  { id: 'cmd17', label: 'Help Center', description: 'Open help documentation', icon: 'question', shortcut: '?', category: 'help', action: 'open:help', keywords: ['docs', 'documentation', 'faq'] },
  { id: 'cmd18', label: 'Keyboard Shortcuts', description: 'View keyboard shortcuts', icon: 'keyboard', shortcut: '? k', category: 'help', action: 'open:shortcuts', keywords: ['hotkeys', 'bindings'] },
  { id: 'cmd19', label: 'Contact Support', description: 'Contact the support team', icon: 'headset', category: 'help', action: 'open:support', keywords: ['help', 'ticket', 'contact'] },
  { id: 'cmd20', label: 'Release Notes', description: 'View release notes and changelog', icon: 'changelog', category: 'help', action: 'open:releases', keywords: ['changelog', 'updates', 'version'] },
  { id: 'cmd21', label: 'Search Everything', description: 'Global search across all entities', icon: 'search', shortcut: '/', category: 'navigation', action: 'open:search', keywords: ['find', 'lookup'] },
];

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private commandsSubject = new BehaviorSubject<Command[]>(SEED_COMMANDS);
  private recentSubject = new BehaviorSubject<string[]>([]);

  readonly commands$: Observable<Command[]> = this.commandsSubject.asObservable();
  readonly recent$: Observable<Command[]> = this.recentSubject.pipe(
    map(ids => ids.map(id => this.commandsSubject.getValue().find(c => c.id === id)!).filter(Boolean))
  );

  get commands(): Command[] {
    return this.commandsSubject.getValue();
  }

  register(command: Command): void {
    this.commandsSubject.next([...this.commands, command]);
  }

  unregister(id: string): void {
    this.commandsSubject.next(this.commands.filter(c => c.id !== id));
  }

  search(query: string): Command[] {
    const q = query.toLowerCase();
    return this.commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  execute(id: string): Command | undefined {
    const command = this.commands.find(c => c.id === id);
    if (!command) return undefined;
    this.addToRecent(id);
    return command;
  }

  getByCategory(category: string): Command[] {
    return this.commands.filter(c => c.category === category);
  }

  getRecent(): Command[] {
    const ids = this.recentSubject.getValue();
    return ids.map(id => this.commands.find(c => c.id === id)!).filter(Boolean);
  }

  addToRecent(id: string): void {
    const current = this.recentSubject.getValue().filter(i => i !== id);
    this.recentSubject.next([id, ...current].slice(0, 10));
  }

  getAll(): Command[] {
    return this.commands;
  }
}
