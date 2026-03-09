import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
  status: 'uploading' | 'complete' | 'error';
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private filesSubject = new BehaviorSubject<FileRecord[]>([]);

  readonly files$: Observable<FileRecord[]> = this.filesSubject.asObservable();

  get files(): FileRecord[] {
    return this.filesSubject.value;
  }

  addFile(record: FileRecord): void {
    this.filesSubject.next([...this.filesSubject.value, record]);
  }

  removeFile(id: string): void {
    this.filesSubject.next(this.filesSubject.value.filter((f) => f.id !== id));
  }

  updateFileStatus(id: string, status: FileRecord['status']): void {
    this.filesSubject.next(
      this.filesSubject.value.map((f) => (f.id === id ? { ...f, status } : f)),
    );
  }

  getFilesByType(type: string): FileRecord[] {
    return this.filesSubject.value.filter((f) => f.type === type);
  }

  getFilesByUser(userId: string): FileRecord[] {
    return this.filesSubject.value.filter((f) => f.uploadedBy === userId);
  }

  getTotalSize(): number {
    return this.filesSubject.value.reduce((sum, f) => sum + f.size, 0);
  }

  addTag(fileId: string, tag: string): void {
    this.filesSubject.next(
      this.filesSubject.value.map((f) =>
        f.id === fileId && !f.tags.includes(tag) ? { ...f, tags: [...f.tags, tag] } : f,
      ),
    );
  }

  removeTag(fileId: string, tag: string): void {
    this.filesSubject.next(
      this.filesSubject.value.map((f) =>
        f.id === fileId ? { ...f, tags: f.tags.filter((t) => t !== tag) } : f,
      ),
    );
  }

  getFilesWithTag(tag: string): FileRecord[] {
    return this.filesSubject.value.filter((f) => f.tags.includes(tag));
  }
}
