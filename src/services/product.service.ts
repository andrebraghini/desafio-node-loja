import { injectable, singleton } from 'tsyringe';
import { Product } from '../entity/product';

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

    /**
     * Retornar lista de produtos que atendam as condições informadas.
     * Retorna todos os registros se as condições não forem informadas.
     * 
     * @param condition Condições de filtro para consulta de produtos
     */
    async get(conditions?: ProductConditions): Promise<Product[]> {
        return [];
    }

    /**
     * Inserir novo produto na base de dados
     * 
     * @param data Dados do produto
     * @returns Código de identificação do produto inserido
     */
    async insert(data: Product): Promise<string> {
        return '';
    }

    /**
     * Atualizar dados do produto na base
     * 
     * @param id Código de identificação do produto
     * @param data Dados do produto
     * @param partialUpdate Indicar se o produto receberá alteração parcial
     */
    async update(id: string, data: Product, partialUpdate: boolean = true): Promise<void> {
        
    }

    /**
     * Remover produto da base de dados
     * 
     * @param id Código de identificação do produto
     */
    async remove(id: string): Promise<void> {
        
    }

}
