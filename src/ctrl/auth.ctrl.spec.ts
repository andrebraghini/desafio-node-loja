import 'reflect-metadata';
import { container } from 'tsyringe';
import { AuthService } from '../services/auth.service';
import { AuthCtrl } from './auth.ctrl';

describe('AuthCtrl', () => {
    let ctrl: AuthCtrl;
    const authServiceMock = {
        getUserByEmail: jest.fn(),
        createToken: jest.fn(),
    };
    const resMock = {
        status: jest.fn(),
        json: jest.fn(),
    }
    
    beforeEach(() => {
        jest.clearAllMocks();
        resMock.status.mockReturnThis();
        resMock.json.mockReturnThis();

        ctrl = container
            .register<AuthService>(AuthService, { useValue: authServiceMock as any })
            .resolve(AuthCtrl);
    });

    describe('constructor()', () => {
        it('deve ser construído', () => {
            expect(ctrl).toBeDefined();
        });
    });

    describe('login()', () => {
        it('deve retornar erro HTTP 401 se não encontrar usuário', () => {
            // Setup
            authServiceMock.getUserByEmail.mockRejectedValue('User not found');
            const req = {
                body: {
                    email: 'fulano@mailna.co',
                    password: 'abc123'
                }
            };

            // Execute
            return ctrl.login(req as any, resMock as any).then(() => {
                // Validate
                expect(authServiceMock.getUserByEmail).toBeCalledWith('fulano@mailna.co');
                expect(resMock.status).toBeCalledWith(401);
                expect(resMock.json).toBeCalledTimes(1);
                expect(resMock.json.mock.calls[0][0])
                    .toMatchObject({
                        success: false,
                        msg: 'Invalid credentials'
                    });
            });
        });
        it('deve retornar erro HTTP 401 se a senha for diferente de "abc123"', () => {
            // Setup
            authServiceMock.getUserByEmail.mockResolvedValue({ uid: 'fj298hjd27uh873' });
            const req = {
                body: {
                    email: 'ciclano@mailna.co',
                    password: 'aaaddd'
                }
            };

            // Execute
            return ctrl.login(req as any, resMock as any).then(() => {
                // Validate
                expect(authServiceMock.getUserByEmail).toBeCalledWith('ciclano@mailna.co');
                expect(resMock.status).toBeCalledWith(401);
                expect(resMock.json).toBeCalledTimes(1);
                expect(resMock.json.mock.calls[0][0])
                    .toMatchObject({
                        success: false,
                        msg: 'Invalid credentials'
                    });
            });
        });
        it('deve retornar token se o usuário existir e a senha for "abc123"', () => {
            // Setup
            authServiceMock.getUserByEmail.mockResolvedValue({ uid: 'fj298hjd27uh873' });
            authServiceMock.createToken.mockResolvedValue('77eee77')
            const req = {
                body: {
                    email: 'funcionario@mailna.co',
                    password: 'abc123'
                }
            };

            // Execute
            return ctrl.login(req as any, resMock as any).then(() => {
                // Validate
                expect(authServiceMock.getUserByEmail).toBeCalledWith('funcionario@mailna.co');
                expect(authServiceMock.createToken).toBeCalledTimes(1);
                expect(authServiceMock.createToken.mock.calls[0][0].uid).toBe('fj298hjd27uh873');
                expect(resMock.json).toBeCalledTimes(1);
                expect(resMock.json.mock.calls[0][0])
                    .toMatchObject({
                        token: '77eee77'
                    });
            });
        });
    });

});
