import 'reflect-metadata';
import { container } from 'tsyringe';
import { FirebaseService } from './firebase.service';

describe('FirebaseService', () => {
    let service: FirebaseService;

    beforeAll(() => {
        service = container.resolve(FirebaseService);
    });
    
    describe('admin()', () => {
        it('deve retornar sempre a mesma instância do firebase admin', () => {
            const firstInstance = service.admin();
            const secondInstance = service.admin();
            expect(firstInstance).toBe(secondInstance);
        });
    });
    
    describe('firestore()', () => {
        it('deve retornar sempre a mesma instância do firestore', () => {
            const firstInstance = service.firestore();
            const secondInstance = service.firestore();
            expect(firstInstance).toBe(secondInstance);
        });
    });

    // TODO: Implementar testes do método config()

});
  