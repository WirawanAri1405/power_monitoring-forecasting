"""
MongoDB Migration Script: Add device_id to existing sensor data

This script:
1. Creates a default device for the first user (or creates a default user if none exists)
2. Adds device_id field to all existing documents in pzem_data1 collection
3. Creates indexes for better query performance

Usage:
    python migrate_device_data.py
"""

from pymongo import MongoClient
import django
import os
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wattara.settings')
django.setup()

from django.contrib.auth.models import User
from monitoring.models import Device


def migrate_device_data():
    """Main migration function"""
    
    print("=" * 60)
    print("MongoDB Device Data Migration Script")
    print("=" * 60)
    
    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["iot_db"]
    collection = db["pzem_data1"]
    
    print(f"\n✓ Connected to MongoDB")
    print(f"  Database: iot_db")
    print(f"  Collection: pzem_data1")
    
    # Count existing documents
    total_docs = collection.count_documents({})
    docs_without_device = collection.count_documents({"device_id": {"$exists": False}})
    
    print(f"\n📊 Current Status:")
    print(f"  Total documents: {total_docs}")
    print(f"  Documents without device_id: {docs_without_device}")
    
    if docs_without_device == 0:
        print("\n✓ All documents already have device_id. Migration not needed.")
        return
    
    # Get or create default user
    print(f"\n👤 Setting up default user...")
    user = User.objects.first()
    
    if not user:
        print("  No users found. Creating default user...")
        user = User.objects.create_user(
            username='admin',
            email='admin@wattara.local',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print(f"  ✓ Created default user: {user.username}")
        print(f"    Email: {user.email}")
        print(f"    Password: admin123")
        print(f"    ⚠️  IMPORTANT: Change this password after first login!")
    else:
        print(f"  ✓ Using existing user: {user.username}")
    
    # Get or create default device
    print(f"\n🔌 Setting up default device...")
    device = Device.objects.filter(user=user).first()
    
    if not device:
        device = Device.objects.create(
            name="Default Power Sensor",
            location="Main Building",
            user=user,
            is_active=True
        )
        print(f"  ✓ Created default device: {device.name}")
        print(f"    Device ID: {device.device_id}")
        print(f"    Owner: {user.username}")
    else:
        print(f"  ✓ Using existing device: {device.name}")
        print(f"    Device ID: {device.device_id}")
    
    # Migrate data
    print(f"\n🔄 Migrating {docs_without_device} documents...")
    
    result = collection.update_many(
        {"device_id": {"$exists": False}},
        {"$set": {"device_id": device.device_id}}
    )
    
    print(f"  ✓ Updated {result.modified_count} documents")
    
    # Create indexes
    print(f"\n📑 Creating indexes for performance...")
    
    try:
        # Index on device_id
        collection.create_index("device_id")
        print(f"  ✓ Created index on 'device_id'")
        
        # Compound index on device_id and timestamp
        collection.create_index([("device_id", 1), ("timestamp", -1)])
        print(f"  ✓ Created compound index on 'device_id' and 'timestamp'")
        
        # Index on timestamp
        collection.create_index([("timestamp", -1)])
        print(f"  ✓ Created index on 'timestamp'")
        
    except Exception as e:
        print(f"  ⚠️  Index creation warning: {e}")
    
    # Verify migration
    print(f"\n✅ Verification:")
    remaining = collection.count_documents({"device_id": {"$exists": False}})
    migrated = collection.count_documents({"device_id": device.device_id})
    
    print(f"  Documents without device_id: {remaining}")
    print(f"  Documents with default device_id: {migrated}")
    
    if remaining == 0:
        print(f"\n🎉 Migration completed successfully!")
    else:
        print(f"\n⚠️  Warning: {remaining} documents still without device_id")
    
    print(f"\n" + "=" * 60)
    print("Next Steps:")
    print("1. Login to Django admin: http://localhost:8000/admin")
    print(f"2. Username: {user.username}")
    print("3. Create additional devices as needed")
    print("4. Update your IoT devices to send device_id in sensor data")
    print("=" * 60)


if __name__ == "__main__":
    try:
        migrate_device_data()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
