import { Component, signal, OnInit, ViewChild } from '@angular/core';
import { DocumentList } from '../admin/documents/document-list/document-list';
import { UploadDocument } from '../admin/documents/upload-document/upload-document';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [DocumentList, UploadDocument],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class Documents implements OnInit {
  
  @ViewChild(DocumentList) documentList!: DocumentList;
  
  showUploadDialog = signal<boolean>(false);

  ngOnInit(): void {
    // Initialization logic if needed
  }

  openUploadDialog(): void {
    this.showUploadDialog.set(true);
  }

  closeUploadDialog(): void {
    this.showUploadDialog.set(false);
  }

  onUploadSuccess(): void {
    // DO NOT auto-close the modal
    // this.closeUploadDialog();  <-- Remove or comment this out
    
    // Refresh the document list in the background
    if (this.documentList) {
      this.documentList.loadDocuments();
    }
  }
}