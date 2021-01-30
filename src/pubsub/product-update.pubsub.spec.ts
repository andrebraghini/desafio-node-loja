import 'reflect-metadata';
import { container } from 'tsyringe';
import { PubSubService } from '../services/pubsub.service';
import { ProductUpdatePubSub, ProductUpdateData } from './product-update.pubsub';

describe('ProductUpdatePubSub', () => {
    let service: ProductUpdatePubSub;
    const pubsubMock = { publish: jest.fn() };
    
    beforeAll(() => {
        container.register<PubSubService>(PubSubService, { useValue: pubsubMock as any });
        service = container.resolve(ProductUpdatePubSub);
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
        it('deve conter o valor product-update', () => {
            expect(ProductUpdatePubSub.topic).toBe('product-update');
        });
    });

    describe('publish()', () => {
        it('fazer publicação no tópico product-update do PubSub', () => {
            // Setup
            pubsubMock.publish.mockResolvedValue(undefined);
            const data: ProductUpdateData = {
                id: 'owinuce8o222',
                name: 'Fanta Uva',
                description: 'Refrigerante',
                category: 'A & B',
                price: 3.5,
                imageURL: 'https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg',
                partialUpdate: true
            };

            // Execute
            return service.publish(data).then(result => {
                // Validate
                expect(pubsubMock.publish).toBeCalledTimes(1);
                expect(pubsubMock.publish.mock.calls[0][0]).toBe('product-update');
                expect(pubsubMock.publish.mock.calls[0][1].id).toBe('owinuce8o222');
                expect(pubsubMock.publish.mock.calls[0][1].name).toBe('Fanta Uva');
                expect(pubsubMock.publish.mock.calls[0][1].description).toBe('Refrigerante');
                expect(pubsubMock.publish.mock.calls[0][1].category).toBe('A & B');
                expect(pubsubMock.publish.mock.calls[0][1].price).toBe(3.5);
                expect(pubsubMock.publish.mock.calls[0][1].imageURL).toBe('https://trimais.vteximg.com.br/arquivos/ids/1002987-1000-1000/foto_original.jpg');
                expect(pubsubMock.publish.mock.calls[0][1].partialUpdate).toBe(true);
            });
        });
    });
    
});
