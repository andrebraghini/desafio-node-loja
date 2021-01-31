import 'reflect-metadata';
import { container } from 'tsyringe';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
    let service: AuthService;
    const firebaseMock = {
        admin: jest.fn(),
        auth: jest.fn(),
        getUser: jest.fn(),
        getUserByEmail: jest.fn(),
        config: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        firebaseMock.admin.mockReturnThis();
        firebaseMock.auth.mockReturnThis();
        firebaseMock.config.mockReturnValue({ auth: { jwt_secret: 'some_secret' } });
        
        service = container
            .register<FirebaseService>(FirebaseService, { useValue: firebaseMock as any })
            .resolve(AuthService);
    });
    
    describe('getUserByEmail()', () => {
        it('deve consultar usuário usando SDK do firebase-admin', () => {
            // Setup
            firebaseMock.getUserByEmail.mockResolvedValue({ uid: 'abc' });

            // Execute
            return service.getUserByEmail('fulano@mailna.co').then(user => {
                // Validate
                expect(user.uid).toBe('abc');
                expect(firebaseMock.getUserByEmail).toBeCalledWith('fulano@mailna.co');
            });
            
        });
    });
    
    describe('createToken()', () => {
        it('deve criar token contendo dados informados', () => {
            // Execute
            const token = service.createToken({ uid: 'errwwq' });

            // Validate
            const decoded = jwt.verify(token, 'some_secret');
            expect(typeof token).toBe('string');
            expect((decoded as any).uid).toBe('errwwq');
        });
    });
    
    describe('getUserByToken()', () => {
        it('deve retornar undefined se o token não for informado se executar as consultas', () => {
            // Execute
            return service.getUserByToken().then(user => {
                // Validate
                expect(user).toBeUndefined();
                expect(firebaseMock.admin).not.toBeCalled();
                expect(firebaseMock.auth).not.toBeCalled();
                expect(firebaseMock.getUser).not.toBeCalled();
            });
        });
        it('deve decodificar token e consultar usuário usando SDK do firebase-admin', () => {
            // Setup
            const token = service.createToken({ uid: 'uid123' });
            const userResolved = { uid: 'uid123' };
            firebaseMock.getUser.mockResolvedValue(userResolved);

            // Execute
            return service.getUserByToken(token).then(user => {
                // Validate
                expect(user).toMatchObject(userResolved);
                expect(firebaseMock.getUser).toBeCalledWith('uid123');
            });
        });
        it('deve retornar undefined suprimindo erros se ocorrerem', () => {
            // Setup
            const token = service.createToken({ uid: 'uid123' });
            firebaseMock.getUser.mockRejectedValue('Unexpected error!');

            // Execute
            return service.getUserByToken(token).then(user => {
                // Validate
                expect(user).toBeUndefined();
            });
        });
    });

});
  