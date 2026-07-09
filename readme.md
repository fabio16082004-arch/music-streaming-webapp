# Music App

A music streaming platform built with Django, split into three separate apps that reflect the three functional domains of the system: **catalog**, **listeners**, and **accounts**.

## Architecture

The project is split into three Django apps, each responsible for a well-defined data domain:

| App | Responsibility                                                               |
|---|------------------------------------------------------------------------------|
| `catalog` | The musical entities: `Track`, `Album`, `Artist`, `Genre`. Managed by curators. |
| `listeners` | Listeners' personal data: `Playlist`, `MonthlyListeningStatistic`.                                    |
| `accounts` | Authentication, custom `User` model, groups and permissions.                 |

## Roles and Permissions

The system uses native **Django Groups** and are reported in the following table.

| Group         | Permissions |
|---------------|---|
| **Listeners** | Read-only access to the catalog (`view_*`); can log playback (`log_playback`, a custom permission on `MonthlyListeningStatistic`). |
| **Curators**  | CRUD on `Track`, `Album`, `Artist`, `Genre` (`add_/change_/delete_/view_*`). |
| **Admin**     | Bypasses all permission checks. |

## Setup and Installation

```bash
# Option A: venv (standard library)
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

# Option B: conda
conda create -n music-app python=3.11
conda activate music-app

# 2. Dependencies
pip install -r requirements.txt

# 3. Database schema
python manage.py makemigrations
python manage.py migrate

# 4. Sample data (order matters: catalog before listeners/accounts,
#    which reference already-existing tracks/users)
python manage.py loaddata accounts_fixture
python manage.py loaddata catalog_fixture
python manage.py loaddata listener_fixture
# 5. Run
python manage.py runserver
```

> The `Listeners`/`Curators` groups and their permissions are created automatically on the first `migrate` — no additional command is needed.

## Test Users

Loaded from `accounts_fixture.json`, same password for all:

| Username | Role | Password |
|---|---|---|
| `listener_one` | Listener | `Password123!` |
| `listener_two` | Listener | `Password123!` |
| `curator_one` | Curator | `Password123!` |
| `main_admin`  | Admin   | `Password123!` |

## Manual Testing Scenario

A short end-to-end walkthrough you can run in the browser after setup, covering login, navigation, data creation/editing, and permission enforcement.

### 1. Permissions as a Listener

1. Go to `http://127.0.0.1:8000/accounts/login/` and log in as `listener_one` / `Password123!`.
2. First, you'll see a list of suggested tracks. 
These are selected by an algorithm based on a score derived from how many seconds 
each song has been played over the last 6 months, combined with the top genres present 
in the user's personal playlists. The algorithm then picks songs from the five 
most-listened genres, excluding songs already in the user's playlists.
3. Open the catalog search page and confirm you can browse tracks, albums, and artists (read-only).
4. Try to reach `http://127.0.0.1:8000/catalog/tracks/create/` directly by URL.
   - **Expected result**: `403 Forbidden` — listeners have `view_*` permissions only, not `add_track`.
5. Log out.

### 2. Playlist workflow as a Listener

1. Log in as `listener_one` / `Password123!`.
2. Go to **Your playlists** and create a new playlist (e.g. "Test Playlist"), toggling **Make it public**.
3. Go back to search, find the track created in step 2, and add it to "Test Playlist" from its **+** menu.
4. Open "Test Playlist" and confirm the track appears in the tracklist.
5. Log out and log in as `listener_two` / `Password123!`.
6. Search for "Test Playlist" (or browse public playlists) and confirm it's visible, with a **+** button to save it to your own collection.
7. Save it, then check **Your playlists → Saved playlists** to confirm it now appears there too.

### 3. Create and edit a Track as a Curator

1. Log in as `curator_one` / `Password123!`.
2. Go to **Add Resource** and select the **Track** tab.
3. Create a new track:
   - Fill in title, release date, and pick an audio file.
   - Optionally pick an existing album: confirm the album's own artist get automatically checked and locked, and that the artist dropdown filters available albums when you change your selection.
4. Submit and confirm you're redirected to the search page, where the new track now appears.
5. Click the track's **⋮ menu → Edit** then change something (for example the title, release date ecc.), and save.
   - **Expected result**: the updated fields is reflected immediately in the search results.
6. From the search results, click **Delete** on the track and confirm via the modal.
   - **Expected result**: the row disappears from the page without a full reload, and the track no longer appears on refresh.

Such operations can be done on the albums, artists and genres too.

### 4. Add and delete new users as an Admin 

1. Now go to `http://127.0.0.1:8000/admin`.
2. Log in as `main_admin`/`Password123!`.
3. Click on `add` below the `ACCOUNTS` voice
4. Enter the username and the password, then click on `Save and continue editing`.
5. Scroll down until you see a box called `Available`
6. Click twice on `Curators`
7. Scroll down again and click on `SAVE`
8. Log out from the admin page and log in with the new credentials created before.