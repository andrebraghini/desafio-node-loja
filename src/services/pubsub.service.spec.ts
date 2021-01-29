import 'reflect-metadata';
import { container } from 'tsyringe';
import { PubSubService } from './pubsub.service';

describe('PubSubService', () => {
    let service: PubSubService;
    const pubsubMock = {
        topic: jest.fn()
    };
    const publishMock = jest.fn();
    pubsubMock.topic.mockReturnValue({ publish: publishMock });

    beforeAll(() => {
        service = container.resolve(PubSubService);
        (service as any).pubsub = () => pubsubMock;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('pubsub()', () => {
        it('deve retornar sempre a mesma instância do PubSub', () => {
            // Setup
            const pubsub = service['pubsub'];

            // Execute
            const firstCall = pubsub();
            const secondCall = pubsub();

            // Validate
            expect(firstCall).toBeDefined();
            expect(secondCall).toBe(firstCall);
        });
    });
    
    describe('publish()', () => {
        it('deve publicar JSON vazio quando não houver conteúdo', () => {
            return service.publish('topic-name')
                .then(() => {
                    expect(pubsubMock.topic).toBeCalledWith('topic-name');
                    expect(publishMock).toBeCalledWith(Buffer.from('{}'), undefined);
                });
        });
        it('deve publicar string se o conteúdo for passado como string', () => {
            return service.publish('topic-name-2', '{ "id": 123 }')
                .then(() => {
                    expect(pubsubMock.topic).toBeCalledWith('topic-name-2');
                    expect(publishMock).toBeCalledWith(Buffer.from('{ "id": 123 }'), undefined);
                });
        });
        it('deve publicar string do objeto em formato JSON ', () => {
            return service.publish('topic-name-3', { id: 123 })
                .then(() => {
                    expect(pubsubMock.topic).toBeCalledWith('topic-name-3');
                    expect(publishMock).toBeCalledWith(Buffer.from('{"id":123}'), undefined);
                });
        });
    });

});
  