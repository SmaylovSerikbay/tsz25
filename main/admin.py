from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category, City, ServiceType, Order, Review, Portfolio, Tariff, BusyDate, Message, OrderResponse, OTP, BookingProposal

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Личная информация', {'fields': ('first_name', 'last_name', 'email')}),
        ('Дополнительная информация', {'fields': ('user_type', 'phone_number', 'bio', 'profile_photo', 'rating')}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )

class OrderAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'event_type', 'event_date', 'city', 'status')
    list_filter = ('status', 'event_type', 'city')
    search_fields = ('title', 'description', 'customer__username', 'city')
    date_hierarchy = 'event_date'

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('order', 'from_user', 'to_user', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('comment', 'from_user__username', 'to_user__username')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Category)
admin.site.register(Order, OrderAdmin)
admin.site.register(Review, ReviewAdmin)
admin.site.register(Portfolio)
admin.site.register(Tariff)
admin.site.register(BusyDate)
admin.site.register(Message)
admin.site.register(OrderResponse)
admin.site.register(OTP)
