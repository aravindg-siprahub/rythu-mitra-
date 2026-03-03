from django.db import models

INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
    'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh',
    'Andaman & Nicobar', 'Chandigarh',
    'Dadra & Nagar Haveli', 'Daman & Diu',
    'Lakshadweep', 'Puducherry'
]

CROP_CHOICES = [
    'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize',
    'Tomato', 'Onion', 'Potato', 'Soybean',
    'Groundnut', 'Sunflower', 'Jowar', 'Bajra',
    'Turmeric', 'Chilli', 'Banana', 'Mango',
    'Grapes', 'Pomegranate', 'Other'
]


class FarmerProfile(models.Model):
    supabase_uid = models.CharField(
        max_length=255, unique=True
    )
    username = models.CharField(
        max_length=50, unique=True
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    state = models.CharField(
        max_length=100, blank=True, null=True
    )
    district = models.CharField(
        max_length=100, blank=True, null=True
    )
    farm_size = models.DecimalField(
        max_digits=10, decimal_places=2,
        blank=True, null=True
    )
    primary_crop = models.CharField(
        max_length=100, blank=True, null=True
    )
    profile_complete = models.BooleanField(
        default=False
    )
    total_predictions = models.IntegerField(
        default=0
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(
        blank=True, null=True
    )

    class Meta:
        db_table = 'farmer_profiles'

    def __str__(self):
        return f"{self.username} - {self.full_name}"
