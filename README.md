# GAMELIST

Aplicação web para criar e gerenciar listas de jogos, 
desenvolvida com React + Vite no front-end e Supabase 
como back-end (banco de dados e autenticação). 

## Tecnologias Utilizadas
 
  * React 18 
  * Vite 
  * React Router DOM (rotas e navegação) 
  * Supabase (autenticação e banco de dados PostgreSQL) 
  * CSS puro com variáveis customizadas 

## Estrutura do Projeto
 
       * AuthContext.jsx       → Gerencia login/logout globalmente 
       * Login.jsx                 → Tela de login 
       * SignUp.jsx              → Tela de cadastro 
       * Listas.jsx                 → Lista de listas do usuário 
       * DetalheLista.jsx      → Jogos dentro de uma lista 
       * Auth.css                  → Estilos das telas de autenticação 
       * Listas.css                → Estilos gerais das páginas 
       * DetalheLista.css      → Estilos da página de detalhe 
       * App.jsx                    → Configuração de rotas 
       * main.jsx                  → Ponto de entrada da aplicação 
       * index.css                 → Variáveis globais de estilo 
       * supabaseClient.js    → Conexão com o Supabase 

## Estrutura das Tabelas | Banco de Dados
 
  ### JOGOS 
  ----- 
  jogo_id     SERIAL PRIMARY KEY 
  titulo      VARCHAR(100)  NOT NULL 
  genero      VARCHAR(30)   NOT NULL 
  descricao   VARCHAR(500)  NOT NULL 
  nota        DECIMAL(3,1)  NOT NULL 
  plataforma  VARCHAR(50)   NOT NULL 
  ano         INT           NOT NULL 
 
  Observação: a tabela jogos já vem populada. 
  Não é possível adicionar jogos pelo app, apenas 
  incluí-los em listas existentes. 
 
  ### LISTAS 
  ------ 
  lista_id      SERIAL PRIMARY KEY 
  usuario_id    UUID         NOT NULL  → referência ao usuário 
autenticado 
  nome          VARCHAR(100) NOT NULL 
  descricao     VARCHAR(300) 
  data_criacao  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP 
 
  ### LISTA_JOGOS  (tabela intermediária) 
  ----------- 
  lista_id    INT → referência a listas(lista_id) 
  jogo_id     INT → referência a jogos(jogo_id) 
  PRIMARY KEY (lista_id, jogo_id) 

## CONFIGURAÇÃO DO AMBIENTE
 
  1. Instalar dependências: 
 
       npm install 
 
  2. Criar o arquivo .env na raiz do projeto 
     com as seguintes variáveis: 
 
       VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co 
       VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_ANON_AQUI 
 
     Os valores se encontram em: 
     Supabase → Settings → API 
 
  3. Rodar o projeto em modo desenvolvimento: 
 
       npm run dev 
 
     O projeto estará disponível em: 
     http://localhost:5173 

## FUNCIONALIDADES
 
  ### Autenticação 
  ------------ 
  - Cadastro de usuário com e-mail e senha 
  - Login e logout 
  - Rotas protegidas (só acessíveis após login) 
  - Redirecionamento automático para /listas após login 
 
  ### Listas 
  ------ 
  - Criar listas com nome e descrição opcional 
  - Visualizar todas as suas listas em cards 
  - Excluir listas (remove também os vínculos com jogos) 
  - Busca/filtro em tempo real por nome ou descrição 
  - Exibe a quantidade de jogos em cada lista 
  - Exibe a data de criação da lista 
 
  ### Jogos dentro de uma lista 
  ------------------------- 
  - Ver todos os jogos adicionados à lista 
  - Buscar jogos da lista por título, gênero ou plataforma 
  - Adicionar jogos à lista a partir do catálogo completo 
  - Buscar jogos disponíveis para adicionar por título 
  - Remover jogos da lista 
  - Exibe gênero, plataforma, ano e nota de cada jogo 
  - Classificação visual da nota: 
      9-10  → Obra-prima  (violeta) 
      7-8   → Bom         (verde) 
      5-6   → Ok          (laranja) 
      1-4   → Fraco       (vermelho) 

---