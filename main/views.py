from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count
from django.http import JsonResponse
from .models import User, Order, Category, Review, Portfolio, Tariff, BusyDate, Message, OrderResponse, OTP, BookingProposal
from .forms import UserRegistrationForm, UserProfileForm, OrderForm, ReviewForm, PortfolioForm, TariffForm
from .services import WhatsAppOTPService
import json
from datetime import datetime, timedelta
from django.views.decorators.http import require_http_methods

def index(request):
    if request.user.is_authenticated:
        return redirect('main:dashboard')
    
    # Получаем 10 последних зарегистрированных исполнителей
    latest_performers = User.objects.filter(
        user_type='performer',
        is_active=True
    ).order_by('-date_joined')[:10]
    
    return render(request, 'index.html', {
        'latest_performers': latest_performers
    })

def auth_page(request):
    """Render the authentication page"""
    if request.user.is_authenticated:
        return redirect('main:dashboard')
    return render(request, 'auth.html')

def register(request):
    if request.method == 'POST':
        verified_phone = request.session.get('verified_phone')
        if not verified_phone:
            messages.error(request, 'Phone verification required')
            return redirect('main:auth')
            
        user_type = request.POST.get('user_type')
        service_type = request.POST.get('service_type') if user_type == 'performer' else None
        
        # Create user with basic fields
        user = User.objects.create_user(
            username=verified_phone,  # Use verified phone as username
            phone_number=verified_phone,
            first_name=request.POST.get('first_name', ''),
            last_name=request.POST.get('last_name', ''),
            city=request.POST.get('city', ''),
            user_type=user_type,
            service_type=service_type,
            is_phone_verified=True,
            email=f"{verified_phone}@example.com",  # Temporary email, can be updated later
        )
        
        # Update performer-specific fields if applicable
        if user_type == 'performer':
            user.company_name = request.POST.get('company_name', '')
            user.bio = request.POST.get('bio', '')
            
        # Handle profile photo upload
        if request.FILES.get('profile_photo'):
            user.profile_photo = request.FILES['profile_photo']
            
        user.save()
        
        login(request, user)
        del request.session['verified_phone']  # Clear session
        messages.success(request, 'Registration successful!')
        return redirect('main:dashboard')
        
    return render(request, 'auth.html', {'is_register': True})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if not username or not password:
            messages.error(request, 'Пожалуйста, введите логин и пароль.')
            return render(request, 'auth.html', {'is_register': False})
            
        # Сначала пробуем аутентифицировать напрямую (если введен username)
        user = authenticate(request, username=username, password=password)
        
        if user is None:
            try:
                # Если не получилось, ищем пользователя по email
                users = User.objects.filter(email=username)
                if users.count() > 1:
                    messages.error(request, 'Найдено несколько пользователей с таким email. Пожалуйста, используйте имя пользователя для входа.')
                    return render(request, 'auth.html', {'is_register': False})
                elif users.exists():
                    # Пробуем аутентифицировать по найденному username
                    user = authenticate(request, username=users.first().username, password=password)
                else:
                    messages.error(request, 'Пользователь не найден.')
                    return render(request, 'auth.html', {'is_register': False})
            except Exception as e:
                messages.error(request, 'Произошла ошибка при попытке входа.')
                return render(request, 'auth.html', {'is_register': False})
        
        if user is not None:
            login(request, user)
            messages.success(request, 'Вы успешно вошли в систему!')
            return redirect('main:dashboard')
        else:
            messages.error(request, 'Неверный пароль.')
            
    return render(request, 'auth.html', {'is_register': False})

@login_required
def profile(request):
    if request.method == 'POST':
        # Update basic user information
        request.user.first_name = request.POST.get('first_name', '')
        request.user.last_name = request.POST.get('last_name', '')
        request.user.email = request.POST.get('email', '')
        request.user.city = request.POST.get('city', '')
        
        # Update performer-specific fields if applicable
        if request.user.user_type == 'performer':
            request.user.company_name = request.POST.get('company_name', '')
            request.user.service_type = request.POST.get('service_type', '')
            request.user.bio = request.POST.get('bio', '')
        
        # Handle profile photo upload
        if request.FILES.get('profile_photo'):
            request.user.profile_photo = request.FILES['profile_photo']
        
        request.user.save()
        messages.success(request, 'Профиль успешно обновлен')
        return redirect('main:profile')
        
    return render(request, 'profile.html', {
        'user': request.user,
        'subscription_plans': [
            {
                'id': 'monthly',
                'name': 'Месячный тариф',
                'price': 10000,
                'duration': '1 месяц'
            },
            {
                'id': 'quarterly',
                'name': 'Квартальный тариф',
                'price': 25000,
                'duration': '3 месяца'
            }
        ],
        'kaspi_payment_url': 'https://pay.kaspi.kz/pay/96yxytne'
    })

@login_required
def process_subscription(request):
    if request.method == 'POST':
        plan_id = request.POST.get('plan_id')
        if plan_id not in ['monthly', 'quarterly']:
            messages.error(request, 'Неверный тариф')
            return redirect('main:dashboard')
            
        # Redirect to Kaspi payment
        return redirect('https://pay.kaspi.kz/pay/96yxytne')
    return redirect('main:dashboard')

def view_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    busy_dates = BusyDate.objects.filter(user=user).order_by('date')
    tariffs = Tariff.objects.filter(user=user).order_by('price')
    return render(request, 'profile.html', {
        'profile_user': user,
        'is_own_profile': request.user == user if request.user.is_authenticated else False,
        'busy_dates': busy_dates,
        'tariffs': tariffs
    })

@login_required
def profile_settings(request):
    if request.method == 'POST':
        # Update basic user information
        request.user.first_name = request.POST.get('first_name', '')
        request.user.last_name = request.POST.get('last_name', '')
        request.user.email = request.POST.get('email', '')
        request.user.city = request.POST.get('city', '')
        
        # Update performer-specific fields if applicable
        if request.user.user_type == 'performer':
            request.user.company_name = request.POST.get('company_name', '')
            request.user.service_type = request.POST.get('service_type', '')
            request.user.bio = request.POST.get('bio', '')
            request.user.services_description = request.POST.get('services_description', '')
            request.user.experience = request.POST.get('experience', '')
        
        # Update notification settings
        request.user.email_notifications = request.POST.get('email_notifications') == 'on'
        request.user.whatsapp_notifications = request.POST.get('whatsapp_notifications') == 'on'
        
        # Handle profile photo upload
        if request.FILES.get('profile_photo'):
            request.user.profile_photo = request.FILES['profile_photo']
        
        request.user.save()
        messages.success(request, 'Профиль успешно обновлен')
        return redirect('main:profile_settings')
        
    return render(request, 'profile_settings.html', {
        'user': request.user
    })

@login_required
def dashboard(request):
    if request.user.user_type == 'performer':
        # Получаем доступные заявки, соответствующие услугам исполнителя
        available_orders = Order.objects.filter(
            status='new',
            order_type='request'
        ).exclude(
            responses__performer=request.user  # Исключаем заявки, на которые уже откликнулись
        ).order_by('-created_at')
        
        # Получаем активные заказы исполнителя
        active_orders = Order.objects.filter(
            performer=request.user,
            status__in=['in_progress', 'new']
        ).order_by('-created_at')
        
        # Получаем отклики исполнителя
        my_responses = OrderResponse.objects.filter(
            performer=request.user
        ).select_related('order').order_by('-created_at')
        
        # Получаем предложения о бронировании
        booking_proposals = BookingProposal.objects.filter(
            performer=request.user,
            status='pending'
        ).select_related('order', 'tariff').order_by('-created_at')
        
        # Получаем портфолио
        portfolio_photos = Portfolio.objects.filter(user=request.user).order_by('-id')
        
        # Получаем тарифы
        tariffs = Tariff.objects.filter(user=request.user).order_by('price')
        
        # Получаем занятые даты
        busy_dates = BusyDate.objects.filter(user=request.user).order_by('date')
        
        # Получаем статистику
        completed_orders_count = Order.objects.filter(
            performer=request.user,
            status='completed'
        ).count()
        
        return render(request, 'dashboard-performer.html', {
            'available_orders': available_orders,
            'active_orders': active_orders,
            'my_responses': my_responses,
            'booking_proposals': booking_proposals,
            'portfolio_photos': portfolio_photos,
            'tariffs': tariffs,
            'busy_dates': busy_dates,
            'completed_orders_count': completed_orders_count,
            'rating': request.user.rating
        })
    elif request.user.user_type == 'customer':
        # Получаем заказы клиента
        orders = Order.objects.filter(customer=request.user).order_by('-created_at')
        return render(request, 'dashboard-customer.html', {'orders': orders})
    
    return redirect('main:index')

def catalog(request):
    performers = User.objects.filter(user_type='performer')\
        .prefetch_related('tariffs', 'orders_received')

    # Фильтры
    category = request.GET.get('category')
    city = request.GET.get('city')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    rating = request.GET.get('rating')
    date = request.GET.get('date')
    
    if category:
        performers = performers.filter(service_type=category)
    if city:
        performers = performers.filter(city__iexact=city)
    if min_price:
        performers = performers.filter(tariffs__price__gte=min_price)
    if max_price:
        performers = performers.filter(tariffs__price__lte=max_price)
    if rating:
        performers = performers.filter(rating__gte=float(rating))
    if date:
        performers = performers.exclude(busydate__date=date)

    # Сортировка
    sort = request.GET.get('sort', '-rating')
    if sort == 'price_low':
        performers = performers.order_by('tariffs__price')
    elif sort == 'price_high':
        performers = performers.order_by('-tariffs__price')
    elif sort == 'rating':
        performers = performers.order_by('-rating')
    elif sort == 'newest':
        performers = performers.order_by('-date_joined')

    # Получаем уникальные города для фильтра
    cities = User.objects.filter(user_type='performer').values_list('city', flat=True).distinct()

    context = {
        'performers': performers.distinct(),
        'cities': cities,
        'current_filters': {
            'category': category,
            'city': city,
            'min_price': min_price,
            'max_price': max_price,
            'rating': rating,
            'date': date,
            'sort': sort
        }
    }
    
    return render(request, 'catalog.html', context)

@login_required
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    # Проверяем, что пользователь имеет право просматривать заказ
    if request.user.user_type == 'performer':
        # Исполнители могут видеть новые заказы и свои заказы
        if order.status != 'new' and request.user != order.performer:
            messages.error(request, 'У вас нет доступа к этому заказу')
            return redirect('main:dashboard')
    elif request.user != order.customer:
        # Заказчики могут видеть только свои заказы
        messages.error(request, 'У вас нет доступа к этому заказу')
        return redirect('main:dashboard')
        
    if request.method == 'POST':
        if request.user.user_type == 'performer' and 'take_order' in request.POST:
            # Исполнитель откликается на заказ
            if order.status == 'new':
                try:
                    # Проверяем, не откликался ли уже исполнитель
                    if OrderResponse.objects.filter(order=order, performer=request.user).exists():
                        messages.error(request, 'Вы уже откликнулись на этот заказ')
                    else:
                        # Создаем отклик
                        response = OrderResponse.objects.create(
                            order=order,
                            performer=request.user,
                            message=request.POST.get('response_message', ''),
                            price=request.POST.get('response_price', 0)
                        )
                        messages.success(request, 'Ваш отклик успешно отправлен')
                except Exception as e:
                    messages.error(request, 'Произошла ошибка при отправке отклика')
            else:
                messages.error(request, 'Этот заказ уже не доступен для отклика')
        
        elif request.user == order.customer:
            if 'accept_response' in request.POST:
                # Заказчик принимает отклик
                response_id = request.POST.get('response_id')
                try:
                    response = OrderResponse.objects.get(id=response_id, order=order)
                    order.performer = response.performer
                    order.status = 'in_progress'
                    order.save()
                    # Удаляем все остальные отклики
                    OrderResponse.objects.filter(order=order).exclude(id=response_id).delete()
                    messages.success(request, 'Исполнитель успешно выбран')
                except OrderResponse.DoesNotExist:
                    messages.error(request, 'Отклик не найден')
            
            elif 'reject_response' in request.POST:
                # Заказчик отклоняет отклик
                response_id = request.POST.get('response_id')
                try:
                    response = OrderResponse.objects.get(id=response_id, order=order)
                    response.delete()
                    messages.success(request, 'Отклик отклонен')
                except OrderResponse.DoesNotExist:
                    messages.error(request, 'Отклик не найден')
            
    # Получаем все отклики для заказа
    responses = OrderResponse.objects.filter(order=order).select_related('performer')
            
    context = {
        'order': order,
        'can_take_order': request.user.user_type == 'performer' and order.status == 'new',
        'is_performer': request.user == order.performer,
        'is_customer': request.user == order.customer,
        'responses': responses if request.user == order.customer else None,
    }
            
    return render(request, 'order_detail.html', context)

@login_required
def create_order_request(request):
    """Создание заявки заказчиком"""
    if request.method == 'POST':
        if request.user.user_type != 'customer':
            messages.error(request, 'Только заказчики могут создавать заявки')
            return redirect('main:dashboard')
            
        form = OrderForm(request.POST)
        if form.is_valid():
            order = form.save(commit=False)
            order.customer = request.user
            order.order_type = 'request'
            order.status = 'new'
            
            services = request.POST.get('services', '[]')
            try:
                order.services = json.loads(services)
            except json.JSONDecodeError:
                order.services = []
                
            order.save()
            messages.success(request, 'Заявка успешно создана')
            return redirect('main:order_detail', order.id)
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме')
    else:
        form = OrderForm()
    
    return render(request, 'order.html', {
        'form': form,
        'is_edit': False
    })

@login_required
def create_order_booking(request, performer_id):
    """Бронирование исполнителя"""
    if request.method == 'POST':
        performer = get_object_or_404(User, id=performer_id, user_type='performer')
        
        # Проверяем, что пользователь является заказчиком
        if request.user.user_type != 'customer':
            messages.error(request, 'Только заказчики могут создавать заявки')
            return redirect('main:profile', performer_id)
            
        # Получаем данные из формы
        event_date_str = request.POST.get('event_date')
        tariff_id = request.POST.get('tariff')
        details = request.POST.get('details')
        
        # Парсим дату
        try:
            event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
            
            # Проверяем, что дата не в прошлом
            if event_date < datetime.now().date():
                messages.error(request, 'Нельзя выбрать прошедшую дату')
                return redirect('main:profile', performer_id)
                
            # Проверяем, что дата не слишком далеко в будущем
            max_date = datetime.now().date() + timedelta(days=180)  # 6 месяцев
            if event_date > max_date:
                messages.error(request, 'Нельзя бронировать более чем на 6 месяцев вперед')
                return redirect('main:profile', performer_id)
                
            # Проверяем, что дата не занята
            if BusyDate.objects.filter(user=performer, date=event_date).exists():
                messages.error(request, 'Эта дата уже занята')
                return redirect('main:profile', performer_id)
                
        except ValueError:
            messages.error(request, 'Неверный формат даты')
            return redirect('main:profile', performer_id)
        
        # Получаем тариф
        try:
            tariff = Tariff.objects.get(id=tariff_id, user=performer)
        except Tariff.DoesNotExist:
            messages.error(request, 'Выбранный тариф не существует')
            return redirect('main:profile', performer_id)
        
        # Создаем заказ
        order = Order.objects.create(
            customer=request.user,
            performer=performer,
            title=f'Заказ на {event_date}',
            event_type='other',
            event_date=event_date,
            city=performer.city,
            venue='',
            guest_count=1,
            description=details,
            budget_min=tariff.price,
            budget_max=tariff.price,
            services=[],  # Пустой список услуг, так как это бронирование
            tariff=tariff,
            details=details,
            order_type='booking',  # Указываем, что это бронирование
            status='in_progress'  # Сразу ставим статус "в работе"
        )
        
        # Добавляем дату в занятые
        BusyDate.objects.create(user=performer, date=event_date)
        
        messages.success(request, 'Бронирование успешно создано')
        return redirect('main:order_detail', order.id)
        
    return redirect('main:profile', performer_id)

@login_required
def create_review(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.order = order
            review.from_user = request.user
            review.to_user = order.performer if request.user == order.customer else order.customer
            review.save()
            messages.success(request, 'Review submitted successfully')
            return redirect('main:order_detail', order_id=order_id)
    else:
        form = ReviewForm()
    return render(request, 'order.html', {'form': form, 'order': order})

@login_required
def edit_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    if request.user != order.customer:
        messages.error(request, 'У вас нет прав для редактирования этого заказа')
        return redirect('main:dashboard')
        
    if request.method == 'POST':
        form = OrderForm(request.POST, instance=order)
        if form.is_valid():
            order = form.save(commit=False)
            services = request.POST.get('services', '[]')
            try:
                order.services = json.loads(services)
            except json.JSONDecodeError:
                order.services = []
            order.save()
            messages.success(request, 'Заказ успешно обновлен!')
            return redirect('main:order_detail', order_id=order.id)
    else:
        form = OrderForm(instance=order)
    
    return render(request, 'order.html', {
        'form': form,
        'order': order,
        'is_edit': True
    })

@login_required
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    if request.user != order.customer:
        messages.error(request, 'У вас нет прав для отмены этого заказа')
        return redirect('main:dashboard')
    
    if request.method == 'POST':
        # Удаляем дату из занятых
        BusyDate.objects.filter(user=order.performer, date=order.event_date).delete()
        
        order.status = 'cancelled'
        order.save()
        messages.success(request, 'Заказ успешно отменен')
        return redirect('main:dashboard')
        
    return render(request, 'cancel_order.html', {'order': order})

@login_required
def delete_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    if request.user != order.customer:
        messages.error(request, 'У вас нет прав для удаления этого заказа')
        return redirect('main:dashboard')
    
    if request.method == 'POST':
        # Удаляем дату из занятых
        BusyDate.objects.filter(user=order.performer, date=order.event_date).delete()
        
        order.delete()
        messages.success(request, 'Заказ успешно удален')
        return redirect('main:dashboard')
        
    return render(request, 'delete_order.html', {'order': order})

def user_logout(request):
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы')
    return redirect('main:auth')

@login_required
def add_portfolio(request):
    if request.method == 'POST':
        form = PortfolioForm(request.POST, request.FILES)
        files = request.FILES.getlist('photos')
        
        for f in files:
            Portfolio.objects.create(user=request.user, image=f)
            
        messages.success(request, 'Фотографии успешно добавлены в портфолио')
        return redirect('main:dashboard')
    
    return redirect('main:dashboard')

@login_required
def manage_tariff(request):
    if request.method == 'POST':
        tariff_id = request.POST.get('tariff_id')
        
        if tariff_id:
            # Edit existing tariff
            tariff = get_object_or_404(Tariff, id=tariff_id, user=request.user)
            form = TariffForm(request.POST, instance=tariff)
        else:
            # Create new tariff
            form = TariffForm(request.POST)
            
        if form.is_valid():
            tariff = form.save(commit=False)
            tariff.user = request.user
            tariff.save()
            messages.success(request, 'Тариф успешно сохранен')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме')
            
    return redirect('main:dashboard')

@login_required
def manage_calendar(request):
    if request.method == 'POST':
        dates = request.POST.get('selected_dates', '[]')
        try:
            dates = json.loads(dates)
            # Clear existing dates
            BusyDate.objects.filter(user=request.user).delete()
            # Add new dates
            for date_str in dates:
                # Parse date in user's timezone
                date = datetime.strptime(date_str, '%Y-%m-%d')
                # Convert to date object (removes time component)
                date = date.date()
                BusyDate.objects.create(user=request.user, date=date)
            messages.success(request, 'Календарь занятости обновлен')
        except json.JSONDecodeError:
            messages.error(request, 'Ошибка при обработке дат')
            
    return redirect('main:dashboard')

@login_required
def delete_portfolio_photo(request, photo_id):
    photo = get_object_or_404(Portfolio, id=photo_id, user=request.user)
    if request.method == 'POST':
        photo.delete()
        messages.success(request, 'Фото успешно удалено')
    return redirect('main:dashboard')

@login_required
def edit_tariff(request, tariff_id):
    tariff = get_object_or_404(Tariff, id=tariff_id, user=request.user)
    if request.method == 'POST':
        form = TariffForm(request.POST, instance=tariff)
        if form.is_valid():
            form.save()
            messages.success(request, 'Тариф успешно обновлен')
            return redirect('main:dashboard')
    
    # Return JSON response for AJAX request
    return JsonResponse({
        'id': tariff.id,
        'name': tariff.name,
        'price': str(tariff.price),
        'description': tariff.description or ''
    })

@login_required
def delete_tariff(request, tariff_id):
    tariff = get_object_or_404(Tariff, id=tariff_id, user=request.user)
    if request.method == 'POST':
        tariff.delete()
        messages.success(request, 'Тариф успешно удален')
    return redirect('main:dashboard')

@login_required
def get_chat_messages(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if request.user != order.performer and request.user != order.customer:
        return JsonResponse({'error': 'Access denied'}, status=403)
        
    messages = Message.objects.filter(order=order).order_by('created_at')
    
    # Mark messages as read
    if request.user == order.performer:
        messages.filter(from_user=order.customer, is_read=False).update(is_read=True)
    else:
        messages.filter(from_user=order.performer, is_read=False).update(is_read=True)
    
    messages_data = [{
        'content': msg.content,
        'timestamp': msg.created_at.strftime('%H:%M'),
        'is_mine': msg.from_user == request.user
    } for msg in messages]
    
    return JsonResponse({'messages': messages_data})

@login_required
def send_chat_message(request, order_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    order = get_object_or_404(Order, id=order_id)
    if request.user != order.performer and request.user != order.customer:
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    try:
        data = json.loads(request.body)
        content = data.get('message', '').strip()
        
        if not content:
            return JsonResponse({'error': 'Message cannot be empty'}, status=400)
            
        Message.objects.create(
            order=order,
            from_user=request.user,
            to_user=order.customer if request.user == order.performer else order.performer,
            content=content
        )
        
        return JsonResponse({'success': True})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

@login_required
def get_user_orders(request):
    """Получение списка активных заявок пользователя для модального окна бронирования"""
    if request.user.user_type != 'customer':
        return JsonResponse({'error': 'Access denied'}, status=403)
        
    orders = Order.objects.filter(
        customer=request.user,
        status='new',
        order_type='request',
        performer__isnull=True  # Только заявки без исполнителя
    ).values('id', 'title', 'event_date')
    
    return JsonResponse({
        'orders': [{
            'id': order['id'],
            'title': order['title'],
            'event_date': order['event_date'].strftime('%d.%m.%Y') if order['event_date'] else ''
        } for order in orders]
    })

@login_required
def attach_performer_to_order(request, order_id, performer_id):
    """Создание предложения о бронировании"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    if request.user.user_type != 'customer':
        return JsonResponse({'error': 'Access denied'}, status=403)
        
    order = get_object_or_404(Order, id=order_id, customer=request.user)
    performer = get_object_or_404(User, id=performer_id, user_type='performer')
    
    try:
        # Получаем данные из формы
        tariff_id = request.POST.get('tariff_id')
        date_str = request.POST.get('date')
        
        if not tariff_id or not date_str:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
            
        tariff = get_object_or_404(Tariff, id=tariff_id, user=performer)
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Проверяем, нет ли уже предложения на эту дату
        if BookingProposal.objects.filter(
            performer=performer,
            date=date,
            status='pending'
        ).exists():
            return JsonResponse({
                'error': 'У исполнителя уже есть предложение на эту дату'
            }, status=400)
            
        # Создаем предложение о бронировании
        proposal = BookingProposal.objects.create(
            order=order,
            performer=performer,
            tariff=tariff,
            date=date,
            status='pending'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Предложение успешно отправлено'
        })
        
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

def send_otp(request):
    if request.method == 'POST':
        phone_number = request.POST.get('phone_number')
        if not phone_number:
            return JsonResponse({'error': 'Phone number is required'}, status=400)

        whatsapp_service = WhatsAppOTPService()
        otp_code = whatsapp_service.generate_otp()
        
        # Save OTP to database
        OTP.objects.create(
            phone_number=phone_number,
            code=otp_code
        )
        
        # Send OTP via WhatsApp
        if whatsapp_service.send_otp(phone_number, otp_code):
            return JsonResponse({'message': 'OTP sent successfully'})
        else:
            return JsonResponse({'error': 'Failed to send OTP'}, status=500)

def verify_otp(request):
    if request.method == 'POST':
        phone_number = request.POST.get('phone_number')
        otp_code = request.POST.get('otp_code')
        
        if not phone_number or not otp_code:
            return JsonResponse({'error': 'Phone number and OTP code are required'}, status=400)
            
        # Get latest OTP for this phone number
        stored_otp = OTP.objects.filter(phone_number=phone_number).order_by('-created_at').first()
        
        if not stored_otp:
            return JsonResponse({'error': 'No OTP found for this phone number'}, status=400)
            
        whatsapp_service = WhatsAppOTPService()
        if whatsapp_service.verify_otp(phone_number, otp_code, stored_otp):
            # Check if user exists
            user = User.objects.filter(phone_number=phone_number).first()
            if user:
                user.is_phone_verified = True
                user.save()
                login(request, user)
                return JsonResponse({'message': 'OTP verified successfully', 'redirect': '/dashboard/'})
            else:
                # Store verified phone in session for registration
                request.session['verified_phone'] = phone_number
                return JsonResponse({'message': 'OTP verified successfully', 'redirect': '/register/'})
        else:
            return JsonResponse({'error': 'Invalid OTP'}, status=400)

@login_required
def update_profile_photo(request):
    """Handle profile photo upload"""
    if request.method == 'POST' and request.FILES.get('profile_photo'):
        user = request.user
        user.profile_photo = request.FILES['profile_photo']
        user.save()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'No photo provided'}, status=400)

@require_http_methods(["GET"])
def get_performer_busy_dates(request, performer_id):
    """API endpoint для получения занятых дат исполнителя"""
    try:
        performer = User.objects.get(id=performer_id, user_type='performer')
        busy_dates = BusyDate.objects.filter(user=performer).values_list('date', flat=True)
        return JsonResponse({
            'busy_dates': [date.strftime('%Y-%m-%d') for date in busy_dates]
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'Performer not found'}, status=404)

@require_http_methods(["GET"])
def get_performer_tariffs(request, performer_id):
    """API endpoint для получения тарифов исполнителя"""
    try:
        performer = User.objects.get(id=performer_id, user_type='performer')
        tariffs = Tariff.objects.filter(user=performer).values('id', 'name', 'price', 'description')
        return JsonResponse({
            'tariffs': list(tariffs)
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'Performer not found'}, status=404)

@login_required
def accept_proposal(request, proposal_id):
    if request.method == 'POST' and request.user.user_type == 'performer':
        proposal = get_object_or_404(BookingProposal, id=proposal_id, performer=request.user)
        
        if proposal.status == 'pending':
            try:
                # Создаем новый заказ или обновляем существующий
                order = proposal.order
                order.performer = request.user
                order.status = 'in_progress'
                order.save()
                
                # Добавляем дату в занятые
                BusyDate.objects.create(
                    user=request.user,
                    date=proposal.date
                )
                
                # Обновляем статус предложения
                proposal.status = 'accepted'
                proposal.save()
                
                messages.success(request, 'Предложение успешно принято')
            except Exception as e:
                messages.error(request, 'Произошла ошибка при принятии предложения')
        else:
            messages.error(request, 'Это предложение уже не доступно')
            
    return redirect('main:dashboard')

@login_required
def reject_proposal(request, proposal_id):
    if request.method == 'POST' and request.user.user_type == 'performer':
        proposal = get_object_or_404(BookingProposal, id=proposal_id, performer=request.user)
        
        if proposal.status == 'pending':
            try:
                # Обновляем статус предложения
                proposal.status = 'rejected'
                proposal.save()
                
                messages.success(request, 'Предложение отклонено')
            except Exception as e:
                messages.error(request, 'Произошла ошибка при отклонении предложения')
        else:
            messages.error(request, 'Это предложение уже не доступно')
            
    return redirect('main:dashboard')
