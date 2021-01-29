import { Request, Response } from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import { onPubSubPublish, onRequest } from 'firebase-triggers';
import { injectable, singleton } from 'tsyringe';
import { ProductAddData, ProductAddPubSub } from '../pubsub/product-add.pubsub';
import { ProductUpdateData, ProductUpdatePubSub } from '../pubsub/product-update.pubsub';
import { ProductRemoveData, ProductRemovePubSub } from '../pubsub/product-remove.pubsub';
import { ProductService } from '../services/product.service';

@singleton()
@injectable()
export class ProductCtrl {

    constructor(
        private productService: ProductService,
        private productAddPubSub: ProductAddPubSub,
        private productUpdatePubSub: ProductUpdatePubSub,
        private productRemovePubSub: ProductRemovePubSub,
    ) {}

    @onRequest({ path: 'products' })
    async rest(request: Request, response: Response) {
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

    private async post(request: Request, response: Response) {
        await this.productAddPubSub.publish(request.body);
        response.status(201).send();
    }

    private async put(request: Request, response: Response) {
        const id = request.path.split('/')[1];
        const partialUpdate = request.method === 'PATCH';
        const data = { ...request.body, id, partialUpdate };
        await this.productUpdatePubSub.publish(data);
        response.status(204).send();
    }

    private async del(request: Request, response: Response) {
        const id = request.path.split('/')[1];
        await this.productRemovePubSub.publish({ id });
        response.status(204).send();
    }

    private async get(request: Request, response: Response) {
        const id = request.path.split('/')[1];
        const product = id && await this.productService.get({ id });

        if (!product && product.length) {
            response
                .status(404)
                .json({
                    success: false,
                    msg: 'Product not found'
                });
        }

        response.json(product[0]);
    }

    private async list(request: Request, response: Response) {
        const products = await this.productService.get(request.query);
        response.json(products);
    }

    @onPubSubPublish(ProductAddPubSub.topic)
    async add(message: Message) {
        const product = message.json as ProductAddData;
        await this.productService.insert(product);
    }

    @onPubSubPublish(ProductUpdatePubSub.topic)
    async update(message: Message) {
        const data = message.json as ProductUpdateData;
        const newData: any = { ...data };
        delete newData.id;
        delete newData.partialUpdate;

        await this.productService.update(data.id, newData, data.partialUpdate);
    }

    @onPubSubPublish(ProductRemovePubSub.topic)
    async remove(message: Message) {
        const { id } = message.json as ProductRemoveData;
        await this.productService.remove(id);
    }

}
