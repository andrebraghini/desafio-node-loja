# Criação de API em NodeJS

Utilizei a biblioteca [firebase-triggers](https://github.com/andrebraghini/firebase-triggers) de minha autoria para vincular os gatilhos do Firebase Functions a métodos de classes utilizando decorators.

Os pontos de entrada da aplicação estão nos controles no diretório [src/ctrl](src/ctrl).

Endpoint de teste: https://us-central1-desafio-node-loja.cloudfunctions.net/products

[Veja exemplos documentados pelo Postman aqui](https://documenter.getpostman.com/view/1414832/TW6zF721).

- Linguagem: **TypeScript**
- Banco de dados: **Firestore**
- Mecanismo de pesquisa: **Algolia**

## História
Dentro de uma arquitetura de micro serviço precisamos de uma API para cadastro de produtos para uma loja genérica.

### Requisitos funcionais
	- Como gerente gostaria de adicionar um novo produto ao catálogo da loja
	- Como gerente gostaria de editar um produto existente no catálogo
	- Como gerente gostaria de remover o produto do meu catálogo da loja
	- Como gerente gostaria de recuperar uma lista com os produtos disponíveis
	- Como gerente gostaria de buscar produtos
	- Como gerente preciso que os resultados sejam páginados
	- Como gerente quero que apenas pessoas com permissão possam: adicionar, editar remover produtos
	- Como cliente quero visualizar um produto
### Requisitos não funcionais
	- A API deve seguir um padrão rest
	- Implemente ao menos 3 testes unitários
	- Trate os possíveis erros com com os padrões HTTP
	- Persistir dados utilizando um NoSQL database

### Entrega
	- Um repositório Git (BitBucket, GitHub, …)
	- Um ambiente rodando a aplicação (Heroku, Firebase, …)

### Critérios de avaliação
	- Entendimento dos requisitos
	- Afinidade com a ferramenta utilizada
	- Testes unitários
	- Estrutura de arquivos
	- Padrão de escrita do código
	- Utilização de boas práticas
