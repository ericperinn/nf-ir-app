import * as SQLite from 'expo-sqlite';

let db;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('notas_fiscais.db');
    await initDatabase(db);
  }
  return db;
};

const initDatabase = async (database) => {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS notas_fiscais (
      id TEXT PRIMARY KEY NOT NULL,
      tipo TEXT NOT NULL,
      numero TEXT,
      emitente TEXT NOT NULL,
      cnpj_cpf TEXT,
      data_emissao TEXT NOT NULL,
      valor_total REAL NOT NULL,
      categoria TEXT NOT NULL,
      descricao TEXT,
      foto_uri TEXT,
      deducivel INTEGER DEFAULT 0,
      percentual_deducao REAL DEFAULT 100,
      observacoes TEXT,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS itens_nota (
      id TEXT PRIMARY KEY NOT NULL,
      nota_id TEXT NOT NULL,
      descricao TEXT NOT NULL,
      quantidade REAL DEFAULT 1,
      valor_unitario REAL NOT NULL,
      valor_total REAL NOT NULL,
      FOREIGN KEY (nota_id) REFERENCES notas_fiscais (id)
    );
  `);
};

export const insertNota = async (nota) => {
  const database = await getDatabase();
  const now = new Date().toISOString();
  
  await database.runAsync(
    `INSERT INTO notas_fiscais 
      (id, tipo, numero, emitente, cnpj_cpf, data_emissao, valor_total, categoria, descricao, foto_uri, deducivel, percentual_deducao, observacoes, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nota.id, nota.tipo, nota.numero, nota.emitente, nota.cnpj_cpf,
      nota.data_emissao, nota.valor_total, nota.categoria, nota.descricao,
      nota.foto_uri, nota.deducivel ? 1 : 0, nota.percentual_deducao,
      nota.observacoes, now, now
    ]
  );
};

export const getAllNotas = async (filtros = {}) => {
  const database = await getDatabase();
  let query = 'SELECT * FROM notas_fiscais WHERE 1=1';
  const params = [];

  if (filtros.categoria) {
    query += ' AND categoria = ?';
    params.push(filtros.categoria);
  }
  if (filtros.ano) {
    query += ' AND strftime("%Y", data_emissao) = ?';
    params.push(String(filtros.ano));
  }
  if (filtros.deducivel !== undefined) {
    query += ' AND deducivel = ?';
    params.push(filtros.deducivel ? 1 : 0);
  }

  query += ' ORDER BY data_emissao DESC';
  return await database.getAllAsync(query, params);
};

export const getNotaById = async (id) => {
  const database = await getDatabase();
  return await database.getFirstAsync('SELECT * FROM notas_fiscais WHERE id = ?', [id]);
};

export const updateNota = async (id, nota) => {
  const database = await getDatabase();
  const now = new Date().toISOString();
  
  await database.runAsync(
    `UPDATE notas_fiscais SET 
      tipo=?, numero=?, emitente=?, cnpj_cpf=?, data_emissao=?, valor_total=?,
      categoria=?, descricao=?, foto_uri=?, deducivel=?, percentual_deducao=?,
      observacoes=?, atualizado_em=?
      WHERE id=?`,
    [
      nota.tipo, nota.numero, nota.emitente, nota.cnpj_cpf, nota.data_emissao,
      nota.valor_total, nota.categoria, nota.descricao, nota.foto_uri,
      nota.deducivel ? 1 : 0, nota.percentual_deducao, nota.observacoes, now, id
    ]
  );
};

export const deleteNota = async (id) => {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM notas_fiscais WHERE id = ?', [id]);
};

export const getResumoAnual = async (ano) => {
  const database = await getDatabase();
  const anoStr = String(ano);
  
  const total = await database.getFirstAsync(
    `SELECT 
      COUNT(*) as total_notas,
      SUM(valor_total) as total_gasto,
      SUM(CASE WHEN deducivel = 1 THEN valor_total * percentual_deducao / 100 ELSE 0 END) as total_deducivel
     FROM notas_fiscais 
     WHERE strftime('%Y', data_emissao) = ?`,
    [anoStr]
  );

  const porCategoria = await database.getAllAsync(
    `SELECT 
      categoria,
      COUNT(*) as qtd,
      SUM(valor_total) as total,
      SUM(CASE WHEN deducivel = 1 THEN valor_total * percentual_deducao / 100 ELSE 0 END) as deducivel
     FROM notas_fiscais 
     WHERE strftime('%Y', data_emissao) = ?
     GROUP BY categoria
     ORDER BY total DESC`,
    [anoStr]
  );

  return { ...total, porCategoria };
};
