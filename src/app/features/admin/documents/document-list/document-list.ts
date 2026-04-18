import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DocumentService, DocumentResponse } from '../../../../core/services/document';
import { HttpEventType } from '@angular/common/http';
import { interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

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

  // Delete/replace state
  deletingId = signal<number | null>(null);        // ID of document being deleted
  confirmDeleteId = signal<number | null>(null);   // ID of document pending confirmation
  successMessage = signal<string | null>(null);    // Toast success message
  replacingId = signal<number | null>(null);       // ID of document being replaced

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

  // ─── Delete Flow ────────────────────────────────────────────────────────────

  askDeleteConfirmation(id: number): void {
    // Show the confirmation dialog for this document
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    this.confirmDeleteId.set(null);
    this.deletingId.set(id);
    this.error.set(null);

    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        // Remove document from list immediately without page reload
        this.documents.update(docs => docs.filter(doc => doc.id !== id));
        this.deletingId.set(null);
        this.showSuccessToast('Document deleted successfully');
      },
      error: (err) => {
        this.deletingId.set(null);
        this.error.set('Failed to delete document. Please try again.');
        console.error('Error deleting document:', err);
      }
    });
  }

  // ─── Replace Flow ───────────────────────────────────────────────────────────

  triggerReplaceFilePicker(id: number): void {
    // Programmatically click the hidden file input for this document
    const input = document.getElementById(`replace-input-${id}`) as HTMLInputElement;
    if (input) input.click();
  }

  onReplaceFileSelected(event: Event, id: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.replacingId.set(id);
    this.error.set(null);

    this.documentService.replaceDocument(id, file).subscribe({
      next: (httpEvent) => {
        if (httpEvent.type === HttpEventType.Response && httpEvent.body) {
          const updatedDoc = httpEvent.body;
          // Update the document in the list in place
          this.documents.update(docs =>
            docs.map(doc => doc.id === id ? updatedDoc : doc)
          );
          this.replacingId.set(null);
          this.showSuccessToast('Document replaced successfully');
          // Start polling until status changes from PENDING
          this.pollDocumentStatus(id);
        }
      },
      error: (err) => {
        this.replacingId.set(null);
        this.error.set('Failed to replace document. Please try again.');
        console.error('Error replacing document:', err);
      }
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private showSuccessToast(message: string): void {
    this.successMessage.set(message);
    // Auto-dismiss after 3 seconds
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private pollDocumentStatus(id: number): void {
    // Check every 3 seconds
    interval(3000).pipe(
      switchMap(() => this.documentService.getDocumentById(id)),
      takeWhile(doc => doc.status === 'PENDING', true) // stop when no longer PENDING
    ).subscribe({
      next: (doc) => {
        // Update the document in the list every tick
        this.documents.update(docs =>
          docs.map(d => d.id === id ? doc : d)
        );
      },
      error: (err) => {
        console.error('Polling error for document ID:', id, err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INDEXED': return 'bg-green-100 text-green-800';
      case 'FAILED':  return 'bg-red-100 text-red-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}