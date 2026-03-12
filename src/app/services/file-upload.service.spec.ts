import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { FileUploadService, FileRecord } from './file-upload.service';

const makeFile = (id: string, type = 'image/png', user = 'u1'): FileRecord => ({
  id,
  name: `file-${id}.png`,
  size: 1024,
  type,
  uploadedAt: new Date(),
  uploadedBy: user,
  url: `https://cdn.example.com/${id}`,
  status: 'complete',
  tags: [],
});

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FileUploadService] });
    service = TestBed.inject(FileUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no files', () => {
    expect(service.files.length).toBe(0);
  });

  it('should add a file', () => {
    service.addFile(makeFile('f1'));
    expect(service.files.length).toBe(1);
  });

  it('should remove a file', () => {
    service.addFile(makeFile('f1'));
    service.removeFile('f1');
    expect(service.files.length).toBe(0);
  });

  it('should update file status', () => {
    service.addFile(makeFile('f1'));
    service.updateFileStatus('f1', 'error');
    expect(service.files[0].status).toBe('error');
  });

  it('should get files by type', () => {
    service.addFile(makeFile('f1', 'image/png'));
    service.addFile(makeFile('f2', 'application/pdf'));
    expect(service.getFilesByType('image/png').length).toBe(1);
  });

  it('should get files by user', () => {
    service.addFile(makeFile('f1', 'image/png', 'u1'));
    service.addFile(makeFile('f2', 'image/png', 'u2'));
    expect(service.getFilesByUser('u1').length).toBe(1);
  });

  it('should calculate total size', () => {
    service.addFile(makeFile('f1'));
    service.addFile(makeFile('f2'));
    expect(service.getTotalSize()).toBe(2048);
  });

  it('should add a tag to a file', () => {
    service.addFile(makeFile('f1'));
    service.addTag('f1', 'important');
    expect(service.files[0].tags).toContain('important');
  });

  it('should not add duplicate tags', () => {
    service.addFile(makeFile('f1'));
    service.addTag('f1', 'important');
    service.addTag('f1', 'important');
    expect(service.files[0].tags.length).toBe(1);
  });

  it('should remove a tag from a file', () => {
    service.addFile(makeFile('f1'));
    service.addTag('f1', 'important');
    service.removeTag('f1', 'important');
    expect(service.files[0].tags.length).toBe(0);
  });

  it('should get files with a specific tag', () => {
    service.addFile(makeFile('f1'));
    service.addFile(makeFile('f2'));
    service.addTag('f1', 'featured');
    expect(service.getFilesWithTag('featured').length).toBe(1);
  });

  it('should emit files via files$', async () => {
    service.addFile(makeFile('f1'));
    const files = await firstValueFrom(service.files$);
    expect(files.length).toBe(1);
  });
});
