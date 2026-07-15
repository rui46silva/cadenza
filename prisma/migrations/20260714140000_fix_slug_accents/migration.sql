-- Corrige slugs onde os acentos tinham sido convertidos em hífens em vez das
-- letras base. Translitera os caracteres acentuados antes de gerar o slug.
-- translate() mapeia cada caractere acentuado para a respetiva letra base.
-- (o ç/ã/õ minúsculos e maiúsculos; o texto é passado a minúsculas antes.)

-- Posts: mantém o sufixo do id para garantir unicidade.
UPDATE "Post"
SET "slug" = trim(both '-' from regexp_replace(
  translate(
    lower("title"),
    'àáâãäåāèéêëēìíîïīòóôõöøōùúûüūçñýÿ',
    'aaaaaaaeeeeeiiiiiooooooouuuuucnyy'
  ),
  '[^a-z0-9]+', '-', 'g'
)) || '-' || substr("id", 1, 6);

-- Notícias: regenera o slug (com sufixo do id para garantir unicidade).
UPDATE "NewsArticle"
SET "slug" = trim(both '-' from regexp_replace(
  translate(
    lower("title"),
    'àáâãäåāèéêëēìíîïīòóôõöøōùúûüūçñýÿ',
    'aaaaaaaeeeeeiiiiiooooooouuuuucnyy'
  ),
  '[^a-z0-9]+', '-', 'g'
)) || '-' || substr("id", 1, 6);
