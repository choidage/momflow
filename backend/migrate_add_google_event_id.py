"""
Add google_event_id column to todos table
"""
import sqlite3

conn = sqlite3.connect('momflow.db')
cursor = conn.cursor()

try:
    # google_event_id 컬럼 추가
    cursor.execute('''
        ALTER TABLE todos 
        ADD COLUMN google_event_id VARCHAR(255)
    ''')
    print("✅ google_event_id 컬럼 추가 완료")
    
    # 인덱스 생성
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_todos_google_event_id 
        ON todos(google_event_id)
    ''')
    print("✅ google_event_id 인덱스 생성 완료")
    
    conn.commit()
    print("\n🎉 데이터베이스 마이그레이션 성공!")
    
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("⚠️ google_event_id 컬럼이 이미 존재합니다.")
    else:
        print(f"❌ 에러 발생: {e}")
        conn.rollback()
finally:
    conn.close()
