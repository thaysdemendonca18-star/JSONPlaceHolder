import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TarefaService } from './services/tarefa';
import { paraTarefa, Tarefa } from './models/tarefa';
@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private tarefaService = inject(TarefaService);
  form = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descricao: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    prioridade: new FormControl<Tarefa['prioridade']>('media', { nonNullable: true }),
    categoria: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<Tarefa['status']>('pendente', { nonNullable: true }),
    dataLimite: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  formEdicao = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descricao: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    prioridade: new FormControl<Tarefa['prioridade']>('media', { nonNullable: true }),
    categoria: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dataLimite: new FormControl('', { nonNullable: true }),
  });
  tarefas = signal<Tarefa[]>([]);
  carregando = signal(false);
  enviando = signal(false);
  erro = signal('');
  idEmEdicao = signal<number | null>(null);
  // A JSONPlaceholder sempre responde ao POST com o mesmo id (101), então geramos
  // um id local exclusivo para cada tarefa criada nesta tela, evitando que duas
  // tarefas criadas colidam com o mesmo id (o que quebra o "track" da lista).
  private proximoIdLocal = Date.now();
  constructor() {
    this.carregar();
  }
  carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.tarefaService.listar().subscribe({
      next: (posts) => {
        this.tarefas.set(posts.map(paraTarefa));
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar as tarefas. Tente novamente.');
        this.carregando.set(false);
      },
    });
  }
  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha todos os campos obrigatórios.');
      return;
    }
    this.enviando.set(true);
    this.erro.set('');
    const tarefa: Tarefa = this.form.getRawValue();
    this.tarefaService.criar(tarefa).subscribe({
      next: (resposta) => {
        this.enviando.set(false);
        const tarefaCriada: Tarefa = { ...resposta, id: this.proximoIdLocal++ };
        this.tarefas.update((lista) => [tarefaCriada, ...lista]);
        this.form.reset({ prioridade: 'media', status: 'pendente' });
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set('Erro ao criar a tarefa. Tente novamente.');
      },
    });
  }
  iniciarEdicao(tarefa: Tarefa) {
    this.idEmEdicao.set(tarefa.id ?? null);
    this.formEdicao.setValue({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      categoria: tarefa.categoria,
      dataLimite: tarefa.dataLimite,
    });
  }
  cancelarEdicao() {
    this.idEmEdicao.set(null);
  }
  salvarEdicao(tarefaAtual: Tarefa) {
    if (!tarefaAtual.id || this.formEdicao.invalid) {
      this.formEdicao.markAllAsTouched();
      this.erro.set('Preencha todos os campos obrigatórios da edição.');
      return;
    }
    const id = tarefaAtual.id;
    const tarefaCompleta: Tarefa = {
      ...tarefaAtual,
      ...this.formEdicao.getRawValue(),
    };
    this.erro.set('');
    // PUT: substitui o recurso inteiro, por isso enviamos todos os campos.
    this.tarefaService.atualizar(id, tarefaCompleta).subscribe({
      next: () => this.aplicarEdicaoLocal(id, tarefaCompleta),
      error: () => {
        // A JSONPlaceholder só possui 100 posts de verdade: tarefas criadas nesta
        // tela (id > 100) não existem no servidor fake, então o PUT sempre
        // responde com erro. Como nada é persistido de fato por essa API de
        // testes, aplicamos a edição localmente mesmo assim.
        if (id > 100) {
          this.aplicarEdicaoLocal(id, tarefaCompleta);
        } else {
          this.erro.set('Erro ao atualizar a tarefa. Tente novamente.');
        }
      },
    });
  }
  private aplicarEdicaoLocal(id: number, tarefaCompleta: Tarefa) {
    this.tarefas.update((lista) => lista.map((t) => (t.id === id ? tarefaCompleta : t)));
    this.idEmEdicao.set(null);
  }
  alternarStatus(tarefa: Tarefa) {
    if (!tarefa.id) return;
    const novoStatus: Tarefa['status'] = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
    // PATCH: altera somente o campo status, preservando o restante do recurso.
    this.tarefaService.atualizarParcial(tarefa.id, { status: novoStatus }).subscribe({
      next: () => {
        this.tarefas.update((lista) =>
          lista.map((t) => (t.id === tarefa.id ? { ...t, status: novoStatus } : t)),
        );
      },
      error: () => this.erro.set('Erro ao atualizar o status. Tente novamente.'),
    });
  }
  excluir(id?: number) {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    this.tarefaService.remover(id).subscribe({
      next: () => this.tarefas.update((lista) => lista.filter((t) => t.id !== id)),
      error: () => this.erro.set('Erro ao excluir a tarefa. Tente novamente.'),
    });
  }
}
