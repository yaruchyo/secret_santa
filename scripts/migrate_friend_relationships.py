import sys
import os
from dotenv import load_dotenv

# Add parent directory to path to import mongo_db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from python_packages.service_repository.mongo_db import MongoDB

# Load environment variables
load_dotenv()

def migrate_friend_relationships():
    """
    Backfill friend relationships for existing wishlists and events.
    
    For Wishlists:
    - Add bidirectional friendship between owner and all subscribers
    
    For Events:
    - Add bidirectional friendship between owner and all participants
    - Add bidirectional friendship between all participants (they're in same event)
    """
    # Get MongoDB credentials from environment
    db_name = os.getenv('MONGO_DB_NAME')
    db_user = os.getenv('MONGO_DB_USER')
    db_pass = os.getenv('MONGO_DB_PASS')
    db_url = os.getenv('MONGO_DB_REST_URL')
    
    if not all([db_name, db_user, db_pass, db_url]):
        print("Error: Missing database credentials in .env file")
        return
    
    # Initialize MongoDB connection
    print(f"Connecting to database: {db_name}...")
    db = MongoDB(db_name, db_user, db_pass, db_url)
    print("Connected to MongoDB\n")
    
    # Track statistics
    total_friendships = 0
    
    # === MIGRATE WISHLISTS ===
    print("=" * 60)
    print("MIGRATING WISHLISTS")
    print("=" * 60)
    
    wishlists = list(db.db['wishlists'].find({}))
    print(f"Found {len(wishlists)} wishlists\n")
    
    for wishlist in wishlists:
        wishlist_name = wishlist.get('name', 'Unknown')
        owner_id = wishlist.get('ownerId')
        subscribers = wishlist.get('subscribers', [])
        
        if not owner_id or not subscribers:
            continue
        
        print(f"Processing: '{wishlist_name}' (Owner: {owner_id}, Subscribers: {len(subscribers)})")
        
        # Add bidirectional friendship between owner and each subscriber
        for subscriber_id in subscribers:
            if subscriber_id == owner_id:
                continue  # Skip if owner is in subscribers
            
            # Add owner to subscriber's friends
            result1 = db.db['users'].update_one(
                {'_id': subscriber_id},
                {'$addToSet': {'friends': owner_id}}
            )
            
            # Add subscriber to owner's friends
            result2 = db.db['users'].update_one(
                {'_id': owner_id},
                {'$addToSet': {'friends': subscriber_id}}
            )
            
            if result1.modified_count > 0 or result2.modified_count > 0:
                total_friendships += 1
                print(f"  ✓ Added friendship: {owner_id} <-> {subscriber_id}")
    
    print()
    
    # === MIGRATE EVENTS ===
    print("=" * 60)
    print("MIGRATING EVENTS")
    print("=" * 60)
    
    events = list(db.db['events'].find({}))
    print(f"Found {len(events)} events\n")
    
    for event in events:
        event_name = event.get('name', 'Unknown')
        owner_id = event.get('ownerId')
        participants = event.get('participants', [])
        
        if not owner_id or not participants:
            continue
        
        participant_ids = [p.get('userId') for p in participants if p.get('userId')]
        
        print(f"Processing: '{event_name}' (Owner: {owner_id}, Participants: {len(participant_ids)})")
        
        # Add bidirectional friendship between owner and each participant
        for participant_id in participant_ids:
            if participant_id == owner_id:
                continue
            
            # Add owner to participant's friends
            db.update_document(
                collection_name="users",
                query={'_id': participant_id},
                update_data={'$addToSet': {'friends': owner_id}}
            )
            
            # Add participant to owner's friends
            db.update_document(
                collection_name="users",
                query={'_id': owner_id},
                update_data={'$addToSet': {'friends': participant_id}}
            )
            
            total_friendships += 1
            print(f"  ✓ Added friendship: {owner_id} <-> {participant_id}")
        
        # Add bidirectional friendships between all participants (they're in same event)
        for i, participant_id_1 in enumerate(participant_ids):
            for participant_id_2 in participant_ids[i+1:]:
                if participant_id_1 == participant_id_2:
                    continue
                
                # Add participant_2 to participant_1's friends
                db.db['users'].update_one(
                    {'_id': participant_id_1},
                    {'$addToSet': {'friends': participant_id_2}}
                )
                
                # Add participant_1 to participant_2's friends
                db.db['users'].update_one(
                    {'_id': participant_id_2},
                    {'$addToSet': {'friends': participant_id_1}}
                )
                
                total_friendships += 1
                print(f"  ✓ Added friendship: {participant_id_1} <-> {participant_id_2}")
    
    print()
    print("=" * 60)
    print(f"Migration complete! Added {total_friendships} friend relationships.")
    print("=" * 60)

if __name__ == "__main__":
    migrate_friend_relationships()
