import 'reflect-metadata';
import { container } from 'tsyringe';
import { FirebaseService } from '../services/firebase.service';
import { UserCtrl } from './user.ctrl';

describe('UserCtrl', () => {
    let ctrl: UserCtrl;
    const firebaseServiceMock = {
        admin: jest.fn(),
        auth: jest.fn(),
        setCustomUserClaims: jest.fn(),
    };
    
    beforeEach(() => {
        jest.clearAllMocks();
        firebaseServiceMock.admin.mockReturnThis();
        firebaseServiceMock.auth.mockReturnThis();

        ctrl = container
            .register<FirebaseService>(FirebaseService, { useValue: firebaseServiceMock as any })
            .resolve(UserCtrl);
    });

    describe('constructor()', () => {
        it('deve ser construído', () => {
            expect(ctrl).toBeDefined();
        });
    });

    describe('setRole()', () => {
        it('não deve executar se o registro for excluído', () => {
            // Setup
            const change = {
                after: {
                    exists: false
                }
            };

            // Execute
            return ctrl.setRole(change as any).then(() => {
                // Validate
                expect(firebaseServiceMock.setCustomUserClaims).not.toBeCalled();
            });
        });
        it('deve definir "admin = true" se a role do usuário for "admin"', () => {
            // Setup
            const change = {
                after: {
                    exists: true,
                    id: 'fej98j2f3',
                    data: jest.fn()
                }
            };
            change.after.data.mockReturnValue({ role: 'admin' });

            // Execute
            return ctrl.setRole(change as any).then(() => {
                // Validate
                expect(firebaseServiceMock.setCustomUserClaims).toBeCalledTimes(1);
                expect(firebaseServiceMock.setCustomUserClaims.mock.calls[0][0]).toBe('fej98j2f3');
                expect(firebaseServiceMock.setCustomUserClaims.mock.calls[0][1])
                    .toMatchObject({ admin: true });
            });
        });
        it('deve definir "admin = false" se a role do usuário for diferente de "admin"', () => {
            // Setup
            const change = {
                after: {
                    exists: true,
                    id: 'fej982j9f3',
                    data: jest.fn()
                }
            };
            change.after.data.mockReturnValue({ role: 'normal' });

            // Execute
            return ctrl.setRole(change as any).then(() => {
                // Validate
                expect(firebaseServiceMock.setCustomUserClaims).toBeCalledTimes(1);
                expect(firebaseServiceMock.setCustomUserClaims.mock.calls[0][0]).toBe('fej982j9f3');
                expect(firebaseServiceMock.setCustomUserClaims.mock.calls[0][1])
                    .toMatchObject({ admin: false });
            });
        });
    });

});
