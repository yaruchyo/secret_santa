import sys
import os
from dotenv import load_dotenv

# Add parent directory to path to import mongo_db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from python_packages.service_repository.mongo_db import MongoDB

# Load environment variables
load_dotenv()

def migrate_wishlist_privacy():
    """
    Add isPublic field to OLD wishlists that don't have it.
    Default to public (true) for backward compatibility.
    
    IMPORTANT: Only updates wishlists that DON'T have the isPublic field.
    Does NOT touch wishlists that already have isPublic set (even if false).
    """
    # Get MongoDB credentials from environment
    db_name = os.getenv('MONGO_DB_NAME')
    db_user = os.getenv('MONGO_DB_USER')
    db_pass = os.getenv('MONGO_DB_PASS')
    db_url = os.getenv('MONGO_DB_REST_URL')
    
    if not all([db_name, db_user, db_pass, db_url]):
        print("Error: Missing database credentials in .env file")
        print("Required: MONGO_DB_NAME, MONGO_DB_USER, MONGO_DB_PASS, MONGO_DB_REST_URL")
        return
    
    # Initialize MongoDB connection
    print(f"Connecting to database: {db_name}...")
    db = MongoDB(db_name, db_user, db_pass, db_url)
    print("Connected to MongoDB\n")
    
    # Find wishlists WITHOUT isPublic field (old wishlists only)
    print("Checking Wishlists...")
    print("Looking for wishlists without 'isPublic' field...\n")
    
    wishlists_to_update = list(db.db['wishlists'].find({'isPublic': {'$exists': False}}))
    
    if not wishlists_to_update:
        print("No old wishlists found. All wishlists already have the 'isPublic' field.\n")
    else:
        print(f"Found {len(wishlists_to_update)} OLD wishlists to migrate (setting isPublic: true).")
        print("Note: Wishlists that already have 'isPublic' field will NOT be touched.\n")
        
        updated_count = 0
        for wishlist in wishlists_to_update:
            wishlist_id = wishlist['_id']
            wishlist_name = wishlist.get('name', 'Unknown')
            owner_name = wishlist.get('ownerName', 'Unknown')
            
            print(f"Updating Wishlist '{wishlist_name}' by {owner_name} ({wishlist_id})")
            
            # Update the wishlist to add isPublic: true
            result = db.db['wishlists'].update_one(
                {'_id': wishlist_id},
                {'$set': {'isPublic': True}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
        
        print(f"\nSuccessfully updated {updated_count} wishlists to public.")
    
    # Also show count of wishlists that already have isPublic set
    existing_public = db.db['wishlists'].count_documents({'isPublic': True})
    existing_private = db.db['wishlists'].count_documents({'isPublic': False})
    
    print(f"\nCurrent state:")
    print(f"  - Public wishlists: {existing_public}")
    print(f"  - Private wishlists: {existing_private}")
    
    print("\nMigration complete.")

if __name__ == "__main__":
    migrate_wishlist_privacy()
