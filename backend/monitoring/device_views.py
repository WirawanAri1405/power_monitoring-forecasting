from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Device
from .serializers import DeviceSerializer, DeviceCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def device_list_create(request):
    """
    List all devices for the authenticated user or create a new device
    
    GET /api/devices/
    POST /api/devices/
    """
    if request.method == 'GET':
        # List all devices owned by the user
        devices = Device.objects.filter(user=request.user)
        serializer = DeviceSerializer(devices, many=True)
        return Response({
            'count': devices.count(),
            'devices': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Create a new device
        serializer = DeviceCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            device = serializer.save()
            return Response(
                DeviceSerializer(device).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def device_detail(request, device_id):
    """
    Retrieve, update, or delete a specific device
    
    GET /api/devices/<device_id>/
    PUT /api/devices/<device_id>/
    DELETE /api/devices/<device_id>/
    """
    try:
        device = Device.objects.get(device_id=device_id, user=request.user)
    except Device.DoesNotExist:
        return Response({
            'error': 'Device not found or you do not have permission to access it'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = DeviceSerializer(device)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = DeviceCreateSerializer(
            device,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                DeviceSerializer(device).data,
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        device_name = device.name
        device.delete()
        return Response({
            'message': f'Device "{device_name}" deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
