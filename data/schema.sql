DROP TABLE IF EXISTS joketb;
CREATE TABLE joketb(
id SERIAL PRIMARY KEY,
type VARCHAR(255),
setup VARCHAR(255),
punchline VARCHAR(255)
);