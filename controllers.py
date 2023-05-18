"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import datetime
import random
import uuid
import random

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_username

url_signer = URLSigner(session)

# Some constants.
MAX_RETURNED_USERS = 20  # Our searches do not return more than 20 users.
MAX_RESULTS = 20  # Maximum number of returned meows.

#TODO:
#index.html gives a signed URL and has ajax that calls get_users with user input string
#get_users finds all users with given string and returns 20 users to index.html
#index.html displays users it got

@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        get_users_url=URL('get_users', signer=url_signer),
        set_follow_url=URL('set_follow', signer=url_signer),
        search_url = URL('search', signer=url_signer),
    )


@action('get_users')
@action.uses(url_signer.verify(), db, auth.user)
def get_users():
    rows = db(db.auth_user.id != auth.user_id).select().as_list()
    follows = db(db.follow.user == auth.user_id).select().as_list()

    ret_obj = {}
    for r in rows:
        ret_obj[r['id']] = False

    for f in follows:
        if f['follower'] in ret_obj.keys():
            ret_obj[f['follower']] = True

    ret_obj_list = []
    for r in rows:
        ret_obj_list.append({"id": r['id'], "followed": ret_obj[r['id']], "username": r['username']})

    ret_obj_list = sorted(ret_obj_list, key=lambda d: d['followed'], reverse=True)

    ret_obj_list = ret_obj_list[:MAX_RETURNED_USERS]

    return dict(rows=rows, ret_obj=ret_obj_list)


@action("set_follow", method="POST")
@action.uses(db, auth.user, url_signer.verify())
def set_follow():
    # Implement.
    follower_id = request.params.get('id')

    # make sure user to follow is not current user
    if auth.user_id == id or id is None:
        return "ERROR: logged in user is same as follower id or follower id is None"
    # make sure user to follow exists

    user_to_follow = db(db.auth_user.id == follower_id).select()

    if not user_to_follow:
        return "ERROR: follower id is not real"

    # if entry exists in follow table, delete it. Else make it
    entry = db((db.follow.user == auth.user_id) & (db.follow.follower == follower_id)).select()

    if entry:
        #delete it
        db(db.follow.user == auth.user_id and db.follow.follower == follower_id).delete()
        return "unfollowed " + str(follower_id)
    else:
        #make it
        db.follow.insert(follower=follower_id)
        return "followed " + str(follower_id)


@action('search')
@action.uses(db, auth.user, url_signer.verify())
def search():
    q = str(request.params.get('q'))


    rows = db((db.auth_user.id != auth.user_id) & (db.auth_user.username.like(q+'%'))).select().as_list()
    follows = db(db.follow.user == auth.user_id).select().as_list()

    ret_obj = {}
    for r in rows:
        ret_obj[r['id']] = False

    for f in follows:
        if f['follower'] in ret_obj.keys():
            ret_obj[f['follower']] = True

    ret_obj_list = []
    for r in rows:
        ret_obj_list.append({"id": r['id'], "followed": ret_obj[r['id']], "username": r['username']})

    ret_obj_list = sorted(ret_obj_list, key=lambda d: d['followed'], reverse=True)

    ret_obj_list = ret_obj_list[:MAX_RETURNED_USERS]

    return dict(rows=rows, ret_obj=ret_obj_list)