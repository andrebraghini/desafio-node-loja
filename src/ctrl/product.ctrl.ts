import { Change, Request, Response } from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import { onFirestoreWrite, onPubSubPublish, onRequest } from 'firebase-triggers';
import { injectable, singleton } from 'tsyringe';
import { ProductAddData, ProductAddPubSub } from '../pubsub/product-add.pubsub';
import { ProductUpdateData, ProductUpdatePubSub } from '../pubsub/product-update.pubsub';
import { ProductRemoveData, ProductRemovePubSub } from '../pubsub/product-remove.pubsub';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';

@singleton()
@injectable()
export class ProductCtrl {

    constructor(
        private authService: AuthService,
        private productService: ProductService,
        private productAddPubSub: ProductAddPubSub,
        private productUpdatePubSub: ProductUpdatePubSub,
        private productRemovePubSub: ProductRemovePubSub,
        private searchService: SearchService,
    ) {}

    /**
     * Verificar se a requisição requer autenticação e já responde caso o usuário não tenha acesso.
     * 
     * @param request 
     * @param response 
     */
    private async validateRequest(request: Request, response: Response): Promise<boolean> {
        if (request.method === 'GET') {
            return true;
        }
        
        const token = request.get('Authorization')?.replace(/^Bearer\s/, '');
        const user: any = await this.authService.getUserByToken(token) || {};
        const result = !!user.customClaims?.admin;

        if (!result) {
            response
                .status(user.uid ? 403 : 401)
                .json({
                    success: false,
                    msg: 'Access denied'
                });
        }

        return result;
    }

    /**
     * Ponto de entrada principal da API REST.
     * A princípio a API poderia chamar os métodos normalmente em um único
     * micro serviço que nesse caso até seria mais performático falando de
     * algo pequeno, porém utilizei o PubSub demonstrar chamadas assíncronas
     * de outros métodos / outros micro serviços. 
     * 
     * @param request 
     * @param response 
     */
    @onRequest({ path: 'products' })
    async rest(request: Request, response: Response) {
        if (!await this.validateRequest(request, response)) {
            return;
        }

        const id = request.path.split('/')[1];
        const methods: any = {
            'GET': id ? this.get : this.list,
            'POST': this.post,
            'PUT': this.put,
            'PATCH': this.put,
            'DELETE': this.del,
        };
        const method = methods[request.method];
        return method.apply(this, [request, response]);
    }

    /**
     * Publicar mensagem via PubSub com dados do produto inserido.
     * A inserção de fato será feita por outro micro serviço quando
     * o gatilho do PubSub for acionado.
     * 
     * @param request 
     * @param response 
     */
    private async post(request: Request, response: Response) {
        await this.productAddPubSub.publish(request.body);
        response.status(201).send();
    }

    /**
     * Publicar mensagem via PubSub com dados do produto alterado.
     * A alteração de fato será feita por outro micro serviço quando
     * o gatilho do PubSub for acionado.
     * 
     * @param request 
     * @param response 
     */
    private async put(request: Request, response: Response) {
        const id = request.path.split('/')[1];
        const partialUpdate = request.method === 'PATCH';
        const data = { ...request.body, id, partialUpdate };
        await this.productUpdatePubSub.publish(data);
        response.status(204).send();
    }

    /**
     * Publicar mensagem via PubSub com o ID do produto removido.
     * A remoção de fato será feita por outro micro serviço quando
     * o gatilho do PubSub for acionado.
     * 
     * @param request 
     * @param response 
     */
    private async del(request: Request, response: Response) {
        const id = request.path.split('/')[1];
        await this.productRemovePubSub.publish({ id });
        response.status(204).send();
    }

    /**
     * Retornar dados de um único produto identificando o mesmo pelo ID.
     * 
     * @param request 
     * @param response 
     */
    private async get(request: Request, response: Response) {
        const id = request.path.split('/')[1];
        const product = id && await this.productService.get({ id });

        if (!(product && product.length)) {
            response
                .status(404)
                .json({
                    success: false,
                    msg: 'Product not found'
                });
            return;
        }

        response.json(product[0]);
    }

    /**
     * Retornar lista de produtos.
     * 
     * @param request 
     * @param response 
     */
    private async list(request: Request, response: Response) {
        const products = await this.productService.get(request.query);
        response.json(products);
    }

    /**
     * Inserir produto no banco de dados.
     * Este método é acionado sempre que uma nova publicação é feita
     * no tópico "product-add" do PubSub.
     * 
     * @param message Dados da publicação no PubSub
     */
    @onPubSubPublish(ProductAddPubSub.topic)
    async add(message: Message) {
        const product = message.json as ProductAddData;
        await this.productService.insert(product);
    }

    /**
     * Alterar dados do produto no banco de dados.
     * Este método é acionado sempre que uma nova publicação é feita
     * no tópico "product-update" do PubSub.
     * 
     * @param message Dados da publicação no PubSub
     */
    @onPubSubPublish(ProductUpdatePubSub.topic)
    async update(message: Message) {
        const data = message.json as ProductUpdateData;
        const newData: any = { ...data };
        delete newData.id;
        delete newData.partialUpdate;

        await this.productService.update(data.id, newData, data.partialUpdate);
    }

    /**
     * Remover produto do banco de dados.
     * Este método é acionado sempre que uma nova publicação é feita
     * no tópico "product-remove" do PubSub.
     * 
     * @param message Dados da publicação no PubSub
     */
    @onPubSubPublish(ProductRemovePubSub.topic)
    async remove(message: Message) {
        const { id } = message.json as ProductRemoveData;
        await this.productService.remove(id);
    }

    /**
     * Atualizar índice do registro no algolia (sistema de busca utilizado).
     * Este método é acionado sempre que um registro for inserido, alterado ou
     * removido do banco de dados (Firestore).
     * Foi feito separadamente dos métodos respectivos de inserção, alteração e
     * remoção porque ele vira outro micro serviço a parte que não interfere na
     * perfomance das outras operações e em caso de falha, também não deve prejudicar
     * o funcionamento das operações dos outros métodos/serviços;
     * 
     * @param change Dados do registro antes e depois da alteração
     */
    @onFirestoreWrite('products/{id}')
    async updateIndex(change: Change<QueryDocumentSnapshot>) {
        if (!change.after.exists) {
            return this.searchService.index('products').deleteObject(change.before.id);
        }

        const newData = change.after.data();
        const objectID = change.after.id;

        return this.searchService
            .index('products')
            .saveObject({ ...newData, objectID });
    }

}
