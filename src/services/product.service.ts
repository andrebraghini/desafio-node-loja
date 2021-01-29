import { injectable, singleton } from 'tsyringe';
import { Product } from '../entity/product';
import { FirebaseService } from './firebase.service';

/**
 * Condições de filtro para consulta de produtos
 */
export interface ProductConditions {

    /** Código de identificação do produto */
    id?: string;

    /** Nome do produto */
    name?: string;

    /** Limite de registros no retorno */
    limit?: number;

    /**
     * Número de registros para deslocar na consulta de
     * forma a montar uma paginação correta.
     */
    offset?: number;
}

@singleton()
@injectable()
export class ProductService {

    constructor(
        private firebase: FirebaseService
    ) {}

    /**
     * Retornar lista de produtos que atendam as condições informadas.
     * Retorna todos os registros se as condições não forem informadas.
     * 
     * @param condition Condições de filtro para consulta de produtos
     */
    async get(conditions?: ProductConditions): Promise<Product[]> {
        const col = await this.firebase
            .firestore()
            .collection('products')
            .get();

        const result: Product[] = [];
        col.forEach(product => {
            const id = product.id;
            const data = product.data();
            result.push({ ...data, id });
        });

        return result;
    }

    /**
     * Inserir novo produto na base de dados
     * 
     * @param data Dados do produto
     * @returns Código de identificação do produto inserido
     */
    async insert(data: Product): Promise<string> {
        const doc = this.firebase
            .firestore()
            .collection('products')
            .doc();

        await doc.set(data);

        return doc.id;
    }

    /**
     * Atualizar dados do produto na base
     * 
     * @param id Código de identificação do produto
     * @param data Dados do produto
     * @param partialUpdate Indicar se o produto receberá alteração parcial
     */
    async update(id: string, data: Product, partialUpdate: boolean = true): Promise<void> {
        const doc = this.firebase
            .firestore()
            .doc(`products/${id}`);

        if (partialUpdate) {
            await doc.update(data);
        } else {
            await doc.set(data);
        }
    }

    /**
     * Remover produto da base de dados
     * 
     * @param id Código de identificação do produto
     */
    async remove(id: string): Promise<void> {
        await this.firebase
            .firestore()
            .doc(`products/${id}`)
            .delete();
    }

}
