"""
Uso:
    python reset_db.py

Va lanciato dalla root del progetto (dove sta manage.py).
Legge le credenziali del database da settings.py, si connette al database
di manutenzione 'postgres' (che esiste sempre), droppa il tuo database
applicativo e lo ricrea vuoto.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'secondo_parziale.settings')  # <-- CAMBIA se il tuo modulo settings si chiama diversamente
django.setup()

from django.conf import settings
import psycopg2

db_config = settings.DATABASES['default']
db_name = db_config['NAME']
db_user = db_config['USER']
db_password = db_config['PASSWORD']
db_host = db_config.get('HOST') or 'localhost'
db_port = db_config.get('PORT') or '5432'

print(f"Database target: {db_name} su {db_host}:{db_port}")

# Connessione al DB di manutenzione 'postgres', NON al DB applicativo
# (non puoi droppare un database a cui sei connesso).
conn = psycopg2.connect(
    dbname='postgres',
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port,
)
conn.autocommit = True  # DROP/CREATE DATABASE non possono girare dentro una transazione

with conn.cursor() as cur:
    # Chiude eventuali connessioni residue al DB target, altrimenti DROP fallisce
    cur.execute("""
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = %s AND pid <> pg_backend_pid();
    """, (db_name,))

    print(f"Elimino il database '{db_name}'...")
    cur.execute(f'DROP DATABASE IF EXISTS "{db_name}";')

    print(f"Ricreo il database '{db_name}'...")
    cur.execute(f'CREATE DATABASE "{db_name}" OWNER "{db_user}";')

conn.close()
print("Fatto. Ora lancia: python manage.py migrate")