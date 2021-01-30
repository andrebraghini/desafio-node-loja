import 'reflect-metadata';
import { container } from 'tsyringe';
import { PubSubService } from '../services/pubsub.service';
import { ProductAddPubSub, ProductAddData } from './product-add.pubsub';

describe('ProductAddPubSub', () => {
    let service: ProductAddPubSub;
    const pubsubMock = { publish: jest.fn() };
    
    beforeAll(() => {
        container.register<PubSubService>(PubSubService, { useValue: pubsubMock as any });
        service = container.resolve(ProductAddPubSub);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor()', () => {
        it('deve construir serviço', () => {
            expect(service).toBeDefined();
        });
    });

    describe('topic', () => {
        it('deve conter o valor product-add', () => {
            expect(ProductAddPubSub.topic).toBe('product-add');
        });
    });

    describe('publish()', () => {
        it('fazer publicação no tópico product-add do PubSub', () => {
            // Setup
            pubsubMock.publish.mockResolvedValue(undefined);
            const data: ProductAddData = {
                name: 'Coca Cola',
                description: 'Refrigerante',
                category: 'A & B',
                price: 3.9,
                imageURL: 'https://cdn.shopify.com/s/files/1/1576/9979/products/CokeCan_600x.png'
            };

            // Execute
            return service.publish(data).then(result => {
                // Validate
                expect(pubsubMock.publish).toBeCalledTimes(1);
                expect(pubsubMock.publish.mock.calls[0][0]).toBe('product-add');
                expect(pubsubMock.publish.mock.calls[0][1].name).toBe('Coca Cola');
                expect(pubsubMock.publish.mock.calls[0][1].description).toBe('Refrigerante');
                expect(pubsubMock.publish.mock.calls[0][1].category).toBe('A & B');
                expect(pubsubMock.publish.mock.calls[0][1].price).toBe(3.9);
                expect(pubsubMock.publish.mock.calls[0][1].imageURL).toBe('https://cdn.shopify.com/s/files/1/1576/9979/products/CokeCan_600x.png');
            });
        });
    });
    
});
