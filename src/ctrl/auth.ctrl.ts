import { Request, Response } from 'firebase-functions';
import { onRequest } from 'firebase-triggers';
import { injectable, singleton } from 'tsyringe';
import { AuthService } from '../services/auth.service';

@singleton()
@injectable()
export class AuthCtrl {

    constructor(
        private authService: AuthService
    ) {}

    @onRequest()
    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        const user = await this.authService
            .getUserByEmail(email)
            .catch(e => undefined);

        // Senha boba para fins didáticos
        if (!user || password !== 'abc123') {
            response
                .status(401)
                .json({
                    success: false,
                    msg: 'Invalid credentials'
                });
            return;
        }

        const token = await this.authService.createToken({ uid: user.uid });
        response.json({ token });
    }

}
