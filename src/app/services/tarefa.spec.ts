import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TarefaService } from './tarefa';
describe('TarefaService', () => {
  let service: TarefaService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(TarefaService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
