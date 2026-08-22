import pg from "pg";

const client = new pg.Client({
  connectionString:
    "postgresql://postgres:globetrotter@localhost:5432/globetrotter",
});

await client.connect();

const tables = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);

const columns = await client.query(`
  SELECT table_name, column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
`);

const fks = await client.query(`
  SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
   AND rc.constraint_schema = tc.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = rc.unique_constraint_name
   AND ccu.constraint_schema = rc.unique_constraint_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
  ORDER BY tc.table_name, kcu.column_name
`);

const uniques = await client.query(`
  SELECT tc.table_name, kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
`);

console.log("TABLES");
for (const row of tables.rows) console.log(`- ${row.table_name}`);

console.log("\nCOLUMNS");
for (const row of columns.rows) {
  console.log(
    `${row.table_name}.${row.column_name} | ${row.data_type} | nullable=${row.is_nullable} | default=${row.column_default}`
  );
}

console.log("\nFOREIGN KEYS");
for (const row of fks.rows) {
  console.log(
    `${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name} ON DELETE ${row.delete_rule}`
  );
}

console.log("\nUNIQUES");
for (const row of uniques.rows) {
  console.log(`${row.table_name}.${row.column_name}`);
}

await client.end();
