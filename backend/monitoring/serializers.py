from rest_framework import serializers
from .models import Device


class DeviceSerializer(serializers.ModelSerializer):
    """Serializer for Device model"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Device
        fields = (
            'id',
            'device_id',
            'name',
            'location',
            'user',
            'user_username',
            'is_active',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'device_id', 'user', 'created_at', 'updated_at')

    def create(self, validated_data):
        # Automatically set the user from the request context
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class DeviceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating devices (simplified)"""
    
    class Meta:
        model = Device
        fields = ('name', 'location', 'is_active')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
