import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentResponse {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'PENDING' | 'INDEXED' | 'FAILED';
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private readonly apiUrl = '/api/documents';

  constructor(private http: HttpClient) {}

  /**
   * Upload a document file to the backend.
   * @param file - The file to upload
   * @returns Observable that emits upload progress events and final response
   */
  uploadDocument(file: File): Observable<HttpEvent<DocumentResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request<DocumentResponse>(req);
  }

  getDocumentById(id: number): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Fetch all documents from the backend.
   * @returns Observable of document array
   */
  getAllDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(this.apiUrl);
  }

    /**
   * Delete a document by ID.
   * @param id - The document ID to delete
   * @returns Observable that completes when deletion is successful (HTTP 204)
   */
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Replace an existing document with a new file.
   * @param id - The document ID to replace
   * @param file - The new file to upload
   * @returns Observable that emits upload progress events and final response
   */
  replaceDocument(id: number, file: File): Observable<HttpEvent<DocumentResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/${id}/replace`, formData, {
      reportProgress: true
    });

    return this.http.request<DocumentResponse>(req);
  }
}