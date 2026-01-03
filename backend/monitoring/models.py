from django.db import models
from django.contrib.auth.models import User
import uuid


def generate_device_id():
    """Generate a unique device ID as a string"""
    return str(uuid.uuid4())


class Device(models.Model):
    """
    Device model for managing IoT power monitoring devices
    Each device belongs to a user and has sensor data in MongoDB
    """
    device_id = models.CharField(
        max_length=100, 
        unique=True, 
        default=generate_device_id,
        editable=False,
        help_text="Unique identifier for the device"
    )
    name = models.CharField(
        max_length=200,
        help_text="Device name (e.g., 'Living Room Sensor')"
    )
    location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Physical location of the device"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='devices',
        help_text="Owner of the device"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the device is currently active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Device'
        verbose_name_plural = 'Devices'

    def __str__(self):
        return f"{self.name} ({self.device_id})"

