import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DocumentService, DocumentResponse } from '../../../../core/services/document';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './document-list.html',
  styleUrls: ['./document-list.css']
})
export class DocumentList implements OnInit {
  
  private documentService = inject(DocumentService);
  
  // Signals for reactive state
  documents = signal<DocumentResponse[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Event emitted when user clicks "Upload Document" button
  @Output() openUpload = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.documentService.getAllDocuments().subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load documents. Please try again.');
        this.loading.set(false);
        console.error('Error loading documents:', err);
      }
    });
  }

  openUploadDialog(): void {
    this.openUpload.emit();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INDEXED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
}