import requests
import random
import json
from django.conf import settings

class WhatsAppOTPService:
    def __init__(self):
        self.base_url = "https://7105.api.greenapi.com"
        self.instance_id = "7105251898"
        self.api_token = "53685780538a4b39a7deeb62cdabbbe5b64ddba9d4e44bcbb6"

    def generate_otp(self):
        """Generate a 6-digit OTP code"""
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])

    def send_otp(self, phone_number, otp_code):
        print(f"[DEV MODE] OTP for {phone_number}: {otp_code}")
        return True

    def verify_otp(self, phone_number, otp_code, stored_otp):
        """Verify the OTP code"""
        if not stored_otp.is_valid():
            return False
            
        stored_otp.attempts += 1
        stored_otp.save()
        
        if stored_otp.code == otp_code:
            stored_otp.is_verified = True
            stored_otp.save()
            return True
            
        return False 