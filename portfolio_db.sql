
-- Ativa Row Level Security na tabela feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Cria política que permite INSERT público (para o formulário)
CREATE POLICY "Allow public insert" 
ON feedback 
FOR INSERT 
TO public 
WITH CHECK (true);
