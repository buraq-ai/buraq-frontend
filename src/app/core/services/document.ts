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

  private readonly apiUrl = 'http://localhost:8081/api/documents';

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

  /**
   * Fetch all documents from the backend.
   * @returns Observable of document array
   */
  getAllDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(this.apiUrl);
  }
}