import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TarefaService } from './services/tarefa';
import { Tarefa } from './models/tarefa';


@Component({
selector: 'app-root',
imports: [ReactiveFormsModule],
templateUrl: './app.html',
styleUrl: './app.css',
})

export class App {
private tarefaService = inject(TarefaService);
form = new FormGroup({
titulo: new FormControl('', { nonNullable: true, validators: [Validators.required]
}),
descricao: new FormControl('', { nonNullable: true, validators:
[Validators.required] }),
prioridade: new FormControl<Tarefa['prioridade']>('media', { nonNullable: true }),
categoria: new FormControl('', { nonNullable: true, validators:
[Validators.required] }),
status: new FormControl<Tarefa['status']>('pendente', { nonNullable: true }),

dataLimite: new FormControl('', { nonNullable: true, validators:
[Validators.required] }),
});
tarefas = signal<Tarefa[]>([]);
enviando = signal(false);
erro = signal('');
// A JSONPlaceholder sempre responde ao POST com o mesmo id (101), então geramos
// um id local exclusivo para cada tarefa criada nesta tela, evitando que duas
// tarefas criadas colidam com o mesmo id (o que quebra o "track" da lista).
private proximoIdLocal = Date.now();
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
}