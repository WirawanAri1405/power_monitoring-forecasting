from django.contrib import admin
from .models import Device


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_id', 'user', 'location', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'user')
    search_fields = ('name', 'device_id', 'location', 'user__username')
    readonly_fields = ('device_id', 'created_at', 'updated_at')

