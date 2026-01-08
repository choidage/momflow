import sqlite3

conn = sqlite3.connect('momflow.db')
cursor = conn.cursor()

# 구글 캘린더에서 가져온 일정 조회
cursor.execute('''
    SELECT id, title, date, start_time, end_time, description, category, google_event_id, created_at
    FROM todos 
    WHERE google_event_id IS NOT NULL 
    ORDER BY date DESC, start_time DESC
    LIMIT 10
''')

rows = cursor.fetchall()

print("\n" + "="*80)
print("구글 캘린더에서 동기화된 일정")
print("="*80 + "\n")

if rows:
    for i, row in enumerate(rows, 1):
        print(f"{i}. [{row[2]}] {row[1]}")
        print(f"   시간: {row[3] or '종일'} ~ {row[4] or ''}")
        print(f"   카테고리: {row[6] or '기타'}")
        if row[5]:
            memo = row[5][:100] + "..." if len(row[5]) > 100 else row[5]
            print(f"   메모: {memo}")
        print(f"   Google Event ID: {row[7]}")
        print(f"   저장 시간: {row[8]}")
        print("-" * 80)
    print(f"\n총 {len(rows)}개의 동기화된 일정이 있습니다.")
else:
    print("아직 동기화된 일정이 없습니다.")
    print("\n설정 화면에서 '일정 동기화' 버튼을 눌러 구글 캘린더 일정을 가져오세요.")

# 전체 todos 개수 확인
cursor.execute('SELECT COUNT(*) FROM todos WHERE deleted_at IS NULL')
total_todos = cursor.fetchone()[0]
print(f"\n데이터베이스의 전체 일정 개수: {total_todos}개")

conn.close()
