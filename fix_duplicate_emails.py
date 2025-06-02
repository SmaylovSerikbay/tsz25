import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tsz2.settings')
django.setup()

from django.db.models import Count
from main.models import User

def fix_duplicate_emails():
    # Находим все email с дубликатами
    duplicates = User.objects.values('email').annotate(
        count=Count('id')
    ).filter(count__gt=1)

    for dup in duplicates:
        email = dup['email']
        users = User.objects.filter(email=email).order_by('date_joined')
        
        # Первый пользователь оставляем как есть
        first_user = users.first()
        print(f"Оставляем email {email} для пользователя {first_user.username}")
        
        # Для остальных изменяем email
        for i, user in enumerate(users[1:], 1):
            new_email = f"{user.username}_{i}@example.com"
            print(f"Изменяем email пользователя {user.username} с {user.email} на {new_email}")
            user.email = new_email
            user.save()

if __name__ == '__main__':
    fix_duplicate_emails()
    print("Готово! Теперь можно применить миграцию.") 