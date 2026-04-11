import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService, DocumentResponse } from '../../../../core/services/document';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-document.html',
  styleUrls: ['./upload-document.css']
})
export class UploadDocument {
  
  private documentService = inject(DocumentService);
  
  // Events for parent component
  @Output() uploadSuccess = new EventEmitter<DocumentResponse>();
  @Output() uploadCancel = new EventEmitter<void>();
  
  // Component state signals
  selectedFile = signal<File | null>(null);
  isDragging = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  errorMessage = signal<string | null>(null);
  uploadComplete = signal<boolean>(false);
  uploadedDocument = signal<DocumentResponse | null>(null);
  
  // Constants
  private readonly ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB

  // Drag and drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  // File input handler
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  // Validate and set selected file
  private handleFileSelection(file: File): void {
    this.errorMessage.set(null);
    this.uploadComplete.set(false);
    this.uploadedDocument.set(null);
    
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage.set('Only PDF and DOCX files are allowed.');
      return;
    }
    
    // Validate file size
    if (file.size > this.MAX_SIZE) {
      this.errorMessage.set('File size cannot exceed 10MB.');
      return;
    }
    
    this.selectedFile.set(file);
  }

  // Clear selected file
  clearFile(): void {
    this.selectedFile.set(null);
    this.errorMessage.set(null);
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  // Upload the selected file
  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) return;
    
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.errorMessage.set(null);
    
    this.documentService.uploadDocument(file).subscribe({
      next: (event) => {
        // Handle progress events
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round((100 * event.loaded) / (event.total || file.size));
          this.uploadProgress.set(percentDone);
        }
        // Handle successful response
        else if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<DocumentResponse>;
          if (response.body) {
            this.uploadComplete.set(true);
            this.uploadedDocument.set(response.body);
            this.uploadSuccess.emit(response.body);
          }
          this.isUploading.set(false);
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadProgress.set(0);
        
        // Handle specific error statuses
        if (err.status === 400) {
          this.errorMessage.set(err.error?.message || 'Invalid file. Please check the file and try again.');
        } else if (err.status === 413) {
          this.errorMessage.set('File size cannot exceed 10MB.');
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('You do not have permission to upload documents.');
        } else {
          this.errorMessage.set('Upload failed. Please try again.');
        }
        console.error('Upload error:', err);
      }
    });
  }

  // Cancel and close the dialog
  cancel(): void {
    this.selectedFile.set(null);
    this.isUploading.set(false);
    this.uploadProgress.set(0);
    this.errorMessage.set(null);
    this.uploadComplete.set(false);
    this.uploadCancel.emit();
  }

  // Reset and upload another file
  uploadAnother(): void {
    this.selectedFile.set(null);
    this.uploadComplete.set(false);
    this.uploadedDocument.set(null);
    this.uploadProgress.set(0);
  }
}