import { UserRecord } from 'firebase-functions/lib/providers/auth';
import { injectable, singleton } from 'tsyringe';
import { FirebaseService } from './firebase.service';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'some_secret';

@singleton()
@injectable()
export class AuthService {

    constructor(
        private firebase: FirebaseService
    ) {}

    /**
     * Retornar dados do usuário localizando o mesmo pelo email.
     * 
     * @param email Email de autenticação do usuário
     */
    async getUserByEmail(email: string) {
        return this.firebase
            .admin()
            .auth()
            .getUserByEmail(email);
    }

    /**
     * Criar token de autenticação.
     * 
     * @param data Dados utilizados no token
     */
    createToken(data: any): string {
        return jwt.sign(data, JWT_SECRET);
    }

    /**
     * Retornar usuário buscando pelo token de autenticação.
     * 
     * @param token Token de autenticação
     */
    async getUserByToken(token?: string): Promise<UserRecord | undefined> {
        if (token) {
            try {
                const data: any = jwt.verify(token, JWT_SECRET);
                const user = await this.firebase
                    .admin()
                    .auth()
                    .getUser(data.uid);

                return user;
            } catch (error) {
                console.error(error);
            }
        }
        return undefined;
    }

}
