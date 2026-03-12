import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Team {
  id: string;
  name: string;
  description: string;
  department: 'engineering' | 'product' | 'sales' | 'support' | 'finance';
  memberIds: string[];
  leadId: string;
  createdAt: Date;
  active: boolean;
}

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team1',
    name: 'Frontend',
    description: 'Frontend engineering team',
    department: 'engineering',
    memberIds: ['u1', 'u2', 'u3'],
    leadId: 'u1',
    createdAt: new Date('2022-01-01'),
    active: true,
  },
  {
    id: 'team2',
    name: 'Backend',
    description: 'Backend engineering team',
    department: 'engineering',
    memberIds: ['u4', 'u5', 'u6'],
    leadId: 'u4',
    createdAt: new Date('2022-01-01'),
    active: true,
  },
  {
    id: 'team3',
    name: 'Platform',
    description: 'Infrastructure and platform',
    department: 'engineering',
    memberIds: ['u7', 'u8'],
    leadId: 'u7',
    createdAt: new Date('2022-02-01'),
    active: true,
  },
  {
    id: 'team4',
    name: 'Product Management',
    description: 'Product strategy',
    department: 'product',
    memberIds: ['u9', 'u10', 'u11'],
    leadId: 'u9',
    createdAt: new Date('2022-01-15'),
    active: true,
  },
  {
    id: 'team5',
    name: 'Design',
    description: 'UX and design',
    department: 'product',
    memberIds: ['u12', 'u13'],
    leadId: 'u12',
    createdAt: new Date('2022-03-01'),
    active: true,
  },
  {
    id: 'team6',
    name: 'Enterprise Sales',
    description: 'Enterprise account team',
    department: 'sales',
    memberIds: ['u14', 'u15', 'u16'],
    leadId: 'u14',
    createdAt: new Date('2022-01-01'),
    active: true,
  },
  {
    id: 'team7',
    name: 'SMB Sales',
    description: 'Small business sales',
    department: 'sales',
    memberIds: ['u17', 'u18'],
    leadId: 'u17',
    createdAt: new Date('2022-04-01'),
    active: true,
  },
  {
    id: 'team8',
    name: 'Customer Support',
    description: 'Level 1 and 2 support',
    department: 'support',
    memberIds: ['u19', 'u20', 'u21'],
    leadId: 'u19',
    createdAt: new Date('2022-01-01'),
    active: true,
  },
  {
    id: 'team9',
    name: 'Finance Ops',
    description: 'Finance operations',
    department: 'finance',
    memberIds: ['u22', 'u23'],
    leadId: 'u22',
    createdAt: new Date('2022-05-01'),
    active: true,
  },
  {
    id: 'team10',
    name: 'Legacy Team',
    description: 'Decommissioned team',
    department: 'engineering',
    memberIds: [],
    leadId: 'u1',
    createdAt: new Date('2021-01-01'),
    active: false,
  },
];

@Injectable({ providedIn: 'root' })
export class TeamService {
  private teamsSubject = new BehaviorSubject<Team[]>(INITIAL_TEAMS);

  readonly teams$: Observable<Team[]> = this.teamsSubject.asObservable();

  readonly activeTeams$: Observable<Team[]> = this.teams$.pipe(
    map((teams) => teams.filter((t) => t.active)),
  );

  get teams(): Team[] {
    return this.teamsSubject.value;
  }

  add(team: Omit<Team, 'id' | 'createdAt'>): Team {
    const newTeam: Team = { ...team, id: crypto.randomUUID(), createdAt: new Date() };
    this.teamsSubject.next([...this.teamsSubject.value, newTeam]);
    return newTeam;
  }

  update(id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>): void {
    this.teamsSubject.next(
      this.teamsSubject.value.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }

  remove(id: string): void {
    this.teamsSubject.next(this.teamsSubject.value.filter((t) => t.id !== id));
  }

  addMember(teamId: string, userId: string): void {
    this.teamsSubject.next(
      this.teamsSubject.value.map((t) =>
        t.id === teamId && !t.memberIds.includes(userId)
          ? { ...t, memberIds: [...t.memberIds, userId] }
          : t,
      ),
    );
  }

  removeMember(teamId: string, userId: string): void {
    this.teamsSubject.next(
      this.teamsSubject.value.map((t) =>
        t.id === teamId ? { ...t, memberIds: t.memberIds.filter((m) => m !== userId) } : t,
      ),
    );
  }

  getByDepartment(department: Team['department']): Team[] {
    return this.teamsSubject.value.filter((t) => t.department === department);
  }

  getMembersOf(teamId: string): string[] {
    return this.teamsSubject.value.find((t) => t.id === teamId)?.memberIds ?? [];
  }

  getTeamsByMember(userId: string): Team[] {
    return this.teamsSubject.value.filter((t) => t.memberIds.includes(userId));
  }
}
