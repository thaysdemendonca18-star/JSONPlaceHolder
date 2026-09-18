export interface Tarefa {
  id?: number;
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  categoria: string;
  status: 'pendente' | 'em-andamento' | 'concluida';
  dataLimite: string;
}
/** Formato real devolvido por GET /posts na JSONPlaceholder. */
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}
/** Adapta um Post da API para o formato de Tarefa usado na tela. */
export function paraTarefa(post: Post): Tarefa {
  return {
    id: post.id,
    titulo: post.title,
    descricao: post.body,
    prioridade: 'media',
    categoria: 'geral',
    status: 'pendente',
    dataLimite: '',
  };
}
