from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = "sqlite:///c:/Users/USER/OneDrive/Desktop/ainote/momflow/backend/momflow.db"
print(f"Checking database at: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

print("\nExisting tables:")
for table_name in inspector.get_table_names():
    print(f"- {table_name}")
    for column in inspector.get_columns(table_name):
        print(f"  - {column['name']} ({column['type']})")
