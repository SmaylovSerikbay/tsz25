from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Order, Review, Portfolio, Tariff

class UserRegistrationForm(UserCreationForm):
    city = forms.CharField(max_length=100, required=True, label='Город')
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'phone_number', 'user_type', 'profile_photo', 'city')

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number', 'bio', 'profile_photo', 'city')

class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['title', 'event_type', 'event_date', 'city', 'venue', 'guest_count', 
                 'description', 'budget_min', 'budget_max']
        widgets = {
            'event_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 4}),
            'budget_min': forms.NumberInput(attrs={'min': '0', 'step': '10000'}),
            'budget_max': forms.NumberInput(attrs={'min': '0', 'step': '10000'}),
            'guest_count': forms.NumberInput(attrs={'min': '1'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        budget_min = cleaned_data.get('budget_min')
        budget_max = cleaned_data.get('budget_max')
        
        if budget_min and budget_max and budget_min > budget_max:
            raise forms.ValidationError('Минимальный бюджет не может быть больше максимального')
        
        return cleaned_data

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

class PortfolioForm(forms.ModelForm):
    class Meta:
        model = Portfolio
        fields = ['image']

class TariffForm(forms.ModelForm):
    class Meta:
        model = Tariff
        fields = ['name', 'price', 'description'] 