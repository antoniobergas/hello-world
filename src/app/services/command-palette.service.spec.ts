import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { CommandPaletteService } from './command-palette.service';

describe('CommandPaletteService', () => {
  let service: CommandPaletteService;

  beforeEach(() => {
    service = new CommandPaletteService();
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should have 21 pre-registered commands', () => {
    expect(service.commands.length).toBe(21);
  });

  it('should expose commands$ observable', async () => {
    const commands = await firstValueFrom(service.commands$);
    expect(commands.length).toBe(21);
  });

  it('should expose recent$ observable (initially empty)', async () => {
    const recent = await firstValueFrom(service.recent$);
    expect(recent.length).toBe(0);
  });

  it('should register a new command', () => {
    service.register({ id: 'cmd99', label: 'Test', description: 'Test cmd', icon: 'test', category: 'actions', action: 'test', keywords: [] });
    expect(service.commands.length).toBe(22);
  });

  it('should unregister a command', () => {
    service.unregister('cmd1');
    expect(service.commands.find(c => c.id === 'cmd1')).toBeUndefined();
    expect(service.commands.length).toBe(20);
  });

  it('should unregister unknown id does nothing', () => {
    service.unregister('unknown');
    expect(service.commands.length).toBe(21);
  });

  it('should search by label case-insensitively', () => {
    const results = service.search('dashboard');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('cmd1');
  });

  it('should search by description', () => {
    const results = service.search('keyboard shortcuts');
    expect(results.some(c => c.id === 'cmd18')).toBe(true);
  });

  it('should search by keywords', () => {
    const results = service.search('csv');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should search returns empty for no match', () => {
    expect(service.search('xyznonexistent')).toEqual([]);
  });

  it('should execute returns the command', () => {
    const cmd = service.execute('cmd1');
    expect(cmd?.id).toBe('cmd1');
  });

  it('should execute returns undefined for unknown id', () => {
    expect(service.execute('unknown')).toBeUndefined();
  });

  it('should execute adds command to recent', () => {
    service.execute('cmd1');
    const recent = service.getRecent();
    expect(recent[0].id).toBe('cmd1');
  });

  it('should addToRecent moves existing to front', () => {
    service.addToRecent('cmd1');
    service.addToRecent('cmd2');
    service.addToRecent('cmd1');
    const recent = service.getRecent();
    expect(recent[0].id).toBe('cmd1');
    expect(recent.filter(c => c.id === 'cmd1').length).toBe(1);
  });

  it('should getRecent returns most recent first', () => {
    service.execute('cmd1');
    service.execute('cmd2');
    service.execute('cmd3');
    const recent = service.getRecent();
    expect(recent[0].id).toBe('cmd3');
  });

  it('should addToRecent trims to max 10', () => {
    for (let i = 1; i <= 12; i++) {
      service.addToRecent(`cmd${i}`);
    }
    expect(service.getRecent().length).toBe(10);
  });

  it('should getByCategory navigation', () => {
    const nav = service.getByCategory('navigation');
    expect(nav.every(c => c.category === 'navigation')).toBe(true);
    expect(nav.length).toBeGreaterThan(0);
  });

  it('should getByCategory actions', () => {
    const actions = service.getByCategory('actions');
    expect(actions.length).toBeGreaterThan(0);
  });

  it('should getAll returns all commands', () => {
    expect(service.getAll().length).toBe(21);
  });

  it('should recent$ observable updates after execute', async () => {
    service.execute('cmd1');
    service.execute('cmd2');
    const recent = await firstValueFrom(service.recent$);
    expect(recent[0].id).toBe('cmd2');
  });

  it('should have cmd1 in pre-registered commands', () => {
    expect(service.commands.find(c => c.id === 'cmd1')).toBeTruthy();
  });
});
