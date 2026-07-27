/*
  A operação tem uma pessoa só. Esta migration ajusta os DADOS (não o schema):

  1. Renomeia a conta principal para "Lucas Martins".
  2. Apaga os demais usuários (vieram dos dados de exemplo). Todas as chaves
     estrangeiras que apontam para `usuarios` são ON DELETE SET NULL, então
     clientes, pagamentos, documentos, observações, timeline e eventos
     continuam existindo — só perdem o vínculo com o usuário apagado.
  3. Passa para o Lucas os clientes que ficaram sem responsável.

  O DELETE é condicionado à existência da conta lucas@lucaslimpanome.com.br:
  se ela não existir neste banco, nada é apagado (evita ficar sem login).
*/

-- 1. Nome da conta principal
UPDATE "usuarios"
SET "nome" = 'Lucas Martins'
WHERE "email" = 'lucas@lucaslimpanome.com.br';

-- 2. Remove os outros usuários
DELETE FROM "usuarios"
WHERE "email" <> 'lucas@lucaslimpanome.com.br'
  AND EXISTS (SELECT 1 FROM "usuarios" u WHERE u."email" = 'lucas@lucaslimpanome.com.br');

-- 3. Clientes órfãos passam a ser do Lucas
UPDATE "clientes"
SET "responsavelId" = (SELECT "id" FROM "usuarios" WHERE "email" = 'lucas@lucaslimpanome.com.br')
WHERE "responsavelId" IS NULL
  AND EXISTS (SELECT 1 FROM "usuarios" u WHERE u."email" = 'lucas@lucaslimpanome.com.br');
