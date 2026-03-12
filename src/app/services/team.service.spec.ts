import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { TeamService } from './team.service';

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    service = new TeamService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 10 seed teams', () => {
    expect(service.teams.length).toBe(10);
  });

  it('should add a new team', () => {
    service.add({
      name: 'QA',
      description: 'Quality assurance',
      department: 'engineering',
      memberIds: [],
      leadId: 'u1',
      active: true,
    });
    expect(service.teams.length).toBe(11);
  });

  it('should assign a UUID on add', () => {
    const t = service.add({
      name: 'QA',
      description: '',
      department: 'engineering',
      memberIds: [],
      leadId: 'u1',
      active: true,
    });
    expect(t.id).toBeTruthy();
  });

  it('should assign createdAt on add', () => {
    const t = service.add({
      name: 'QA',
      description: '',
      department: 'engineering',
      memberIds: [],
      leadId: 'u1',
      active: true,
    });
    expect(t.createdAt).toBeInstanceOf(Date);
  });

  it('should update a team name', () => {
    service.update('team1', { name: 'Frontend v2' });
    expect(service.teams.find((t) => t.id === 'team1')?.name).toBe('Frontend v2');
  });

  it('should remove a team', () => {
    service.remove('team1');
    expect(service.teams.find((t) => t.id === 'team1')).toBeUndefined();
  });

  it('should addMember to a team', () => {
    service.addMember('team1', 'u99');
    expect(service.teams.find((t) => t.id === 'team1')?.memberIds).toContain('u99');
  });

  it('should not add duplicate members', () => {
    service.addMember('team1', 'u1');
    const team = service.teams.find((t) => t.id === 'team1')!;
    expect(team.memberIds.filter((m) => m === 'u1').length).toBe(1);
  });

  it('should removeMember from a team', () => {
    service.removeMember('team1', 'u1');
    expect(service.teams.find((t) => t.id === 'team1')?.memberIds).not.toContain('u1');
  });

  it('should getByDepartment: engineering', () => {
    const eng = service.getByDepartment('engineering');
    expect(eng.every((t) => t.department === 'engineering')).toBe(true);
    expect(eng.length).toBeGreaterThan(0);
  });

  it('should getByDepartment: sales returns 2 teams', () => {
    const sales = service.getByDepartment('sales');
    expect(sales.length).toBe(2);
  });

  it('should getMembersOf returns member IDs', () => {
    const members = service.getMembersOf('team1');
    expect(members).toContain('u1');
    expect(members).toContain('u2');
  });

  it('should getMembersOf returns empty for unknown team', () => {
    expect(service.getMembersOf('nonexistent')).toHaveLength(0);
  });

  it('should getTeamsByMember returns correct teams', () => {
    const teams = service.getTeamsByMember('u4');
    expect(teams.some((t) => t.id === 'team2')).toBe(true);
  });

  it('should return empty array for member in no team', () => {
    expect(service.getTeamsByMember('nobody')).toHaveLength(0);
  });

  it('should emit teams via teams$', async () => {
    const teams = await firstValueFrom(service.teams$);
    expect(teams.length).toBe(10);
  });

  it('should emit only active teams via activeTeams$', async () => {
    const active = await firstValueFrom(service.activeTeams$);
    expect(active.every((t) => t.active)).toBe(true);
    expect(active.length).toBe(9);
  });

  it('should handle removeMember for non-member gracefully', () => {
    const before = service.getMembersOf('team1').length;
    service.removeMember('team1', 'nobody');
    expect(service.getMembersOf('team1').length).toBe(before);
  });

  it('should update active flag', () => {
    service.update('team10', { active: true });
    expect(service.teams.find((t) => t.id === 'team10')?.active).toBe(true);
  });

  it('should getByDepartment: finance returns 1 team', () => {
    const finance = service.getByDepartment('finance');
    expect(finance.length).toBe(1);
    expect(finance[0].id).toBe('team9');
  });
});
