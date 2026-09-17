export interface Tarefa {
    
  id?: number;
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  categoria: string;
  status: 'pendente' | 'em-andamento' | 'concluida';
  dataLimite: string;
}
