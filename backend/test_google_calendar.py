"""
Google Calendar API 테스트 스크립트
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.database import SessionLocal
from app.models.user import User
from app.services.calendar_service import GoogleCalendarService
from datetime import datetime, timedelta

async def test_google_calendar():
    """Google Calendar API 테스트"""
    db = SessionLocal()
    try:
        # 첫 번째 사용자 가져오기
        user = db.query(User).filter(User.deleted_at.is_(None)).first()
        
        if not user:
            print("❌ 사용자를 찾을 수 없습니다.")
            return
        
        if not user.google_calendar_token:
            print("❌ Google Calendar 토큰이 없습니다.")
            return
        
        print(f"✅ 사용자: {user.email}")
        print(f"✅ Google Calendar 연동 상태: {user.google_calendar_enabled}")
        print(f"✅ 토큰 존재: {bool(user.google_calendar_token)}")
        print()
        
        # 시간 범위 설정 (1월 1일 ~ 1월 31일)
        time_min = datetime(2026, 1, 1, 0, 0, 0)
        time_max = datetime(2026, 1, 31, 23, 59, 59)
        
        print(f"📅 요청 시간 범위:")
        print(f"   시작: {time_min.isoformat()}Z (UTC)")
        print(f"   종료: {time_max.isoformat()}Z (UTC)")
        print(f"   시작: {(time_min + timedelta(hours=9)).isoformat()} (한국시간)")
        print(f"   종료: {(time_max + timedelta(hours=9)).isoformat()} (한국시간)")
        print()
        
        # Google Calendar에서 이벤트 가져오기
        print("🔄 Google Calendar API 호출 중...")
        events = await GoogleCalendarService.list_events(
            token_json=user.google_calendar_token,
            time_min=time_min,
            time_max=time_max,
            max_results=100
        )
        
        print(f"✅ 이벤트 {len(events)}개 가져옴")
        print()
        
        if len(events) > 0:
            print("📋 이벤트 목록:")
            for i, event in enumerate(events[:5], 1):  # 처음 5개만 표시
                start = event.get('start', {})
                summary = event.get('summary', '제목 없음')
                
                if 'dateTime' in start:
                    start_str = start['dateTime']
                elif 'date' in start:
                    start_str = start['date']
                else:
                    start_str = 'N/A'
                
                print(f"  {i}. {summary} - {start_str}")
        else:
            print("⚠️ 이벤트가 없습니다.")
            print("   Google Calendar에 해당 기간 내 이벤트가 있는지 확인하세요.")
        
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_google_calendar())

