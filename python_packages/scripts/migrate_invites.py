import os
import uuid
import sys
from dotenv import load_dotenv
from python_packages.service_repository.mongo_db import MongoDB

# Add the python_packages to path so we can import the module
# Assuming this script is run from the project root
sys.path.append(os.path.join(os.getcwd(), 'python_packages'))



load_dotenv()

def migrate():
    db_name = os.getenv("MONGO_DB_NAME")
    user = os.getenv("MONGO_DB_USER")
    password = os.getenv("MONGO_DB_PASS")
    rest_url = os.getenv("MONGO_DB_REST_URL")

    if not all([db_name, user, password, rest_url]):
        print("Error: Missing environment variables. Make sure .env is loaded.")
        print(f"DB_NAME: {db_name}")
        print(f"USER: {user}")
        # Don't print password
        print(f"REST_URL: {rest_url}")
        return

    print(f"Connecting to database: {db_name}...")
    try:
        mongo = MongoDB(db_name, user, password, rest_url)
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    # Update Wishlists
    print("\nChecking Wishlists...")
    # Find wishlists where inviteId is missing or null
    wishlists = mongo.find_documents("wishlists", {"inviteId": {"$exists": False}})
    # Also check for null just in case
    wishlists_null = mongo.find_documents("wishlists", {"inviteId": None})
    
    all_wishlists_to_update = wishlists + wishlists_null
    # Remove duplicates if any (though find_documents returns list of dicts, so simple dedupe might be tricky, 
    # but usually these queries are distinct enough. Let's just iterate and check ID)
    
    seen_ids = set()
    unique_wishlists = []
    for w in all_wishlists_to_update:
        if w["_id"] not in seen_ids:
            unique_wishlists.append(w)
            seen_ids.add(w["_id"])

    count = 0
    if not unique_wishlists:
        print("No wishlists need migration.")
    else:
        print(f"Found {len(unique_wishlists)} wishlists to migrate.")
        for w in unique_wishlists:
            new_invite_id = str(uuid.uuid4())
            print(f"Updating Wishlist '{w.get('name', 'Unknown')}' ({w['_id']}) with inviteId: {new_invite_id}")
            mongo.update_document("wishlists", {"_id": w["_id"]}, {"inviteId": new_invite_id})
            count += 1
        print(f"Successfully updated {count} wishlists.")

    # Update Events
    print("\nChecking Events...")
    events = mongo.find_documents("events", {"inviteId": {"$exists": False}})
    events_null = mongo.find_documents("events", {"inviteId": None})
    
    all_events_to_update = events + events_null
    seen_ids = set()
    unique_events = []
    for e in all_events_to_update:
        if e["_id"] not in seen_ids:
            unique_events.append(e)
            seen_ids.add(e["_id"])

    count = 0
    if not unique_events:
        print("No events need migration.")
    else:
        print(f"Found {len(unique_events)} events to migrate.")
        for e in unique_events:
            new_invite_id = str(uuid.uuid4())
            print(f"Updating Event '{e.get('name', 'Unknown')}' ({e['_id']}) with inviteId: {new_invite_id}")
            mongo.update_document("events", {"_id": e["_id"]}, {"inviteId": new_invite_id})
            count += 1
        print(f"Successfully updated {count} events.")
    
    mongo.close_connection()
    print("\nMigration complete.")

if __name__ == "__main__":
    migrate()
