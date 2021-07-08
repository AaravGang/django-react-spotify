from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import Request,post,put,get
from .credentials import *
from rest_framework import status
from rest_framework.response import Response

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_tokens(session_key):
    user_tokens = SpotifyToken.objects.filter(user = session_key)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None
    

def create_or_update_user_tokens(session_key,access_token,token_type,refresh_token,expires_in):
    tokens = get_user_tokens(session_key)
    expires_in = timezone.now() + timedelta(seconds = expires_in)
    
    if tokens:
       tokens.access_token = access_token
       tokens.refresh_token = refresh_token
       tokens.expires_in = expires_in
       tokens.token_type = token_type
       tokens.save(update_fields=["access_token","refresh_token","expires_in","token_type"])

    else:
        tokens = SpotifyToken(user = session_key,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        token_type=token_type)
        tokens.save()


def is_spotify_authenticated(session_key):
    tokens = get_user_tokens(session_key)
    if tokens:
        expiry = tokens.expires_in
        if expiry<=timezone.now():
            refresh_spotify_token(session_key)
        return True

    return False

def refresh_spotify_token(session_key):
    tokens = get_user_tokens(session_key)

    refresh_token = tokens.refresh_token

    response = post("https://accounts.spotify.com/api/token",data={
        "grant_type":"refresh_token",
        "refresh_token":refresh_token,
        "client_id":CLIENT_ID,
        "client_secret":CLIENT_SECRET
    }).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in  = response.get("expires_in")
    

    create_or_update_user_tokens(session_key=session_key,
    access_token=access_token,
    token_type=token_type,refresh_token=refresh_token,expires_in=expires_in)


def execute_spotify_request(session_key,endpoint,post_=False,put_=False,BASE_URL="https://api.spotify.com/v1/me/"):
    tokens = get_user_tokens(session_key)
    headers = {
        "Content-Type":"application/json",
        "Authorization":"Bearer "+tokens.access_token,
    }

    if post_:
        post(BASE_URL+endpoint,headers=headers)

    elif put_:
        put(BASE_URL+endpoint,headers=headers)

    response = get(BASE_URL+endpoint,{},headers=headers)

    try:
        return response.json()
    except Exception as e:

        return {"error":"Issue with request"}




