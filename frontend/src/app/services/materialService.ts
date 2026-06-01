import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  DatiMaterialeDidattico,
  MaterialeAcquistatoApi,
  MaterialeDidatticoApi,
} from '../interfaces/material.interfaces';
import type { RispostaOperazione } from '../interfaces/risposta.interfaces';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  constructor(private http: HttpClient) {}

  createMaterial(payload: DatiMaterialeDidattico) {
    const formData = new FormData();
    formData.append('titolo', payload.titolo);
    formData.append('descrizione', payload.descrizione || '');
    formData.append('materia', payload.materia || '');
    formData.append('importo', String(payload.importo || 0));
    formData.append('file', payload.file);
    if (payload.anteprima) formData.append('anteprima', payload.anteprima);
    if (payload.copertina) formData.append('copertina', payload.copertina);

    return firstValueFrom(
      this.http.post<MaterialeDidatticoApi>(
        `${environment.apiUrl}/api/materials/upload`,
        formData,
      ),
    );
  }

  deleteMaterial(materialeId: number | string) {
    return firstValueFrom(
      this.http.delete<RispostaOperazione>(
        `${environment.apiUrl}/api/materials/${materialeId}`,
      ),
    );
  }

  purchaseMaterial(materialeId: number | string) {
    return firstValueFrom(
      this.http.post<MaterialeDidatticoApi | RispostaOperazione>(
        `${environment.apiUrl}/api/materials/${materialeId}/purchase`,
        {},
      ),
    );
  }

  getPurchasedMaterials() {
    return firstValueFrom(
      this.http.get<MaterialeAcquistatoApi[]>(
        `${environment.apiUrl}/api/materials/purchased/me`,
      ),
    );
  }

  downloadMaterial(materialeId: number | string) {
    return firstValueFrom(
      this.http.get(`${environment.apiUrl}/api/materials/${materialeId}/download`, {
        responseType: 'blob',
      }),
    );
  }
}
