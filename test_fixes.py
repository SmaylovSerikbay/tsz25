#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tsz2.settings')
django.setup()

from main.models import User, City, ServiceType, Order

def test_fixes():
    """Тестирует все исправления"""
    print("🧪 Тестирование исправлений...")
    
    # Проверяем города
    cities = City.objects.filter(is_active=True)
    print(f"✅ Города в базе: {cities.count()}")
    for city in cities:
        print(f"   - {city.name}")
    
    # Проверяем типы услуг
    service_types = ServiceType.objects.filter(is_active=True)
    print(f"✅ Типы услуг в базе: {service_types.count()}")
    for st in service_types:
        print(f"   - {st.name} ({st.code}) - {st.icon}")
    
    # Проверяем пользователей
    users = User.objects.all()
    print(f"✅ Пользователей в базе: {users.count()}")
    
    for user in users:
        print(f"   - {user.get_full_name()} ({user.user_type})")
        if user.city:
            print(f"     Город: {user.city.name}")
        else:
            print(f"     Город: не указан")
        if user.service_type:
            print(f"     Услуга: {user.service_type.name}")
        else:
            print(f"     Услуга: не указана")
    
    # Проверяем заказы
    orders = Order.objects.all()
    print(f"✅ Заказов в базе: {orders.count()}")
    
    for order in orders:
        print(f"   - {order.title} (город: {order.city}, услуги: {order.services})")
    
    print("\n🎯 Все проверки завершены!")

if __name__ == '__main__':
    test_fixes() 