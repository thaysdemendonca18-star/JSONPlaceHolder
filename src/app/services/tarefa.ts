import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post, Tarefa } from '../models/tarefa';
@Injectable({ providedIn: 'root' })
export class TarefaService {
  private http = inject(HttpClient);
  private api = 'https://jsonplaceholder.typicode.com/posts';
  listar() {
    return this.http.get<Post[]>(`${this.api}?_limit=5&userId=1`);
  }
  criar(tarefa: Tarefa) {
    return this.http.post<Tarefa>(this.api, tarefa);
  }
  atualizar(id: number, tarefa: Tarefa) {
    return this.http.put<Tarefa>(`${this.api}/${id}`, tarefa);
  }
  atualizarParcial(id: number, dados: Partial<Tarefa>) {
    return this.http.patch<Tarefa>(`${this.api}/${id}`, dados);
  }
  remover(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
