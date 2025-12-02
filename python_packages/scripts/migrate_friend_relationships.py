import sys
import os
from dotenv import load_dotenv
from bson import ObjectId  # <--- CRITICAL IMPORT

# Add parent directory to path to import mongo_db
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from service_repository.mongo_db import MongoDB

# Load environment variables
load_dotenv()


def migrate_friend_relationships():
    db_name = os.getenv('MONGO_DB_NAME')
    db_user = os.getenv('MONGO_DB_USER')
    db_pass = os.getenv('MONGO_DB_PASS')
    db_url = os.getenv('MONGO_DB_REST_URL')

    if not all([db_name, db_user, db_pass, db_url]):
        print("Error: Missing database credentials in .env file")
        return

    print(f"Connecting to database: {db_name}...")
    db = MongoDB(db_name, db_user, db_pass, db_url)
    print("Connected to MongoDB\n")

    total_friendships = 0

    # Helper function to handle bidirectional friendship
    def make_friends(user_id_a_str, user_id_b_str):
        if user_id_a_str == user_id_b_str:
            return 0

        count = 0
        try:
            # 1. Add B to A's friends list
            # Note: We convert _id to ObjectId for the QUERY,
            # but we save the String ID in the friends array.
            res1 = db.db['users'].update_one(
                {'_id': ObjectId(user_id_a_str)},
                {'$addToSet': {'friends': user_id_b_str}}
            )

            # 2. Add A to B's friends list
            res2 = db.db['users'].update_one(
                {'_id': ObjectId(user_id_b_str)},
                {'$addToSet': {'friends': user_id_a_str}}
            )

            if res1.modified_count > 0 or res2.modified_count > 0:
                count = 1
                print(f"  ✓ Linked: {user_id_a_str} <-> {user_id_b_str}")
        except Exception as e:
            print(f"  X Error linking {user_id_a_str} and {user_id_b_str}: {e}")

        return count

    # === MIGRATE WISHLISTS ===
    print("=" * 60)
    print("MIGRATING WISHLISTS")
    print("=" * 60)

    wishlists = list(db.db['wishlists'].find({}))
    print(f"Found {len(wishlists)} wishlists\n")

    for wishlist in wishlists:
        wishlist_name = wishlist.get('name', 'Unknown')
        owner_id = wishlist.get('ownerId')  # String
        subscribers = wishlist.get('subscribers', [])  # List of Strings

        if not owner_id or not subscribers:
            continue

        print(f"Processing Wishlist: '{wishlist_name}'")

        # Owner <-> Subscribers
        for subscriber_id in subscribers:
            total_friendships += make_friends(owner_id, subscriber_id)

            # OPTIONAL: If subscribers of the same wishlist should also be friends
            # enable the loop below. (Based on your description, only Owner<->Sub is required here)
            for other_sub in subscribers:
                make_friends(subscriber_id, other_sub)

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
        participants_data = event.get('participants', [])

        # Extract participant IDs (Strings)
        participant_ids = [p.get('userId') for p in participants_data if p.get('userId')]

        # Create a set of unique IDs involved in this event (Owner + Participants)
        involved_users = set(participant_ids)
        if owner_id:
            involved_users.add(owner_id)

        involved_users_list = list(involved_users)

        if len(involved_users_list) < 2:
            continue

        print(f"Processing Event: '{event_name}' ({len(involved_users_list)} users)")

        # Create relationships between EVERYONE in the event
        # (Owner <-> Participant) AND (Participant <-> Participant)
        for i in range(len(involved_users_list)):
            for j in range(i + 1, len(involved_users_list)):
                u1 = involved_users_list[i]
                u2 = involved_users_list[j]
                total_friendships += make_friends(u1, u2)

    print()
    print("=" * 60)
    print(f"Migration complete! Operations performed: {total_friendships}")
    print("=" * 60)


if __name__ == "__main__":
    migrate_friend_relationships()