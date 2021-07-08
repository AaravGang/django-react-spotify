from django.shortcuts import render,redirect
from .credentials import *
from requests import Request,post,get
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .utils import *
from api.models import Room


class AuthUrl(APIView):
    def get(self,request,format=None):
        scopes = "playlist-read-private playlist-read-collaborative user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played user-read-private user-read-email"
        url = Request("GET","https://accounts.spotify.com/authorize",
        params={
            "scope":scopes,
            "response_type":"code",
            "redirect_uri":REDIRECT_URI,
            "client_id":CLIENT_ID,
            
        }).prepare().url

        return Response({"url":url},status=status.HTTP_200_OK)

def spotify_callback(request,format=None):
    code = request.GET.get('code')
    error = request.GET.get("error")

    response = post("https://accounts.spotify.com/api/token",data={
        "grant_type":"authorization_code",
        "code":code,
        "redirect_uri":REDIRECT_URI,
        "client_id":CLIENT_ID,
        "client_secret":CLIENT_SECRET
        
    }).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in  = response.get("expires_in")
    error = response.get("error")
    print(access_token)

    if not request.session.exists(request.session.session_key):
        request.session.create()

    create_or_update_user_tokens(session_key=request.session.session_key,
    access_token=access_token,
    token_type=token_type,
    refresh_token=refresh_token,
    expires_in=expires_in)

    return redirect("frontend:")


class IsAuthenticated(APIView):
    def get(self,request,format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status":is_authenticated},status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self,request,format=None):

        room_code = self.request.session.get("room_code")

        queryset = Room.objects.filter(code=room_code)
        if not queryset.exists():
            return Response({"Room Not found":"Room with provided room code does not exist"},status=status.HTTP_404_NOT_FOUND)
        room = queryset[0]
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_request(host,endpoint)

        if "error" in response or "item" not in response:
            return Response({"Error":"This error is likely because you are not currently playing a song."},status=status.HTTP_204_NO_CONTENT)

        item = response.get("item")
        title = item.get("name")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get('url')
        is_playing = response.get("is_playing")
        song_id = item.get("id")

        artists = ''.join([f"{artist.get('name')}, " for i,artist in enumerate(item.get("artists"))])[:-2]
        song = {
            "title":title,
            "artists":artists,
            "duration":duration,
            "progress":progress,
            "image_url":album_cover,
            "is_playing":is_playing,
            "votes":0,
            "id":song_id
        }

        return Response(song,status=status.HTTP_200_OK)

class GetPlaylists(APIView):
    def get(self,request,format=None):

        room_code = self.request.session.get("room_code")

        queryset = Room.objects.filter(code=room_code)
        if not queryset.exists():
            return Response({"Room Not found":"Room with provided room code does not exist"},status=status.HTTP_404_NOT_FOUND)
        room = queryset[0]
        host = room.host
        playlists_endpoint = "playlists"
        response = execute_spotify_request(host,playlists_endpoint)

        if "error" in response or "items" not in response:
            return Response({"Error":response.get("error")},status=status.HTTP_204_NO_CONTENT)
        items = response.get("items")
       
        playlists = [{"description":item.get("description"),
        "id":item.get("id"),
        "name":item.get("name"),
        "image":item.get("images")[0].get("url"),
        "owner":{"id":item.get("owner").get("id"),"name":item.get("owner").get("display_name")}} for item in items]
       
        return Response(playlists,status=status.HTTP_200_OK)

class Tracks(APIView):
   def get(self,request,format=None):

        room_code = self.request.session.get("room_code")

        queryset = Room.objects.filter(code=room_code)
        if not queryset.exists():
            return Response({"Room Not found":"Room with provided room code does not exist"},status=status.HTTP_404_NOT_FOUND)
        room = queryset[0]
        host = room.host
        playlists_endpoint = "playlists"
        response = execute_spotify_request(host,playlists_endpoint)

        if "error" in response or "items" not in response:
            return Response({"Error":response.get("error")},status=status.HTTP_204_NO_CONTENT)
        items = response.get("items")
       
        playlists = [{"description":item.get("description"),
        "id":item.get("id"),
        "name":item.get("name"),
        "image":item.get("images")[0].get("url"),
        "owner":{"id":item.get("owner").get("id"),"name":item.get("owner").get("display_name")}} for item in items]
        all_tracks = []
        for playlist in playlists:
            print(playlist.get('id'))
            tracks_endpoint = f'https://api.spotify.com/v1/playlists/{playlist.get("id")}/tracks'
            tracks_response = execute_spotify_request(host,tracks_endpoint,BASE_URL="")
            if "error" in tracks_response or "items" not in tracks_response: 
                print(tracks_response.get("error"))
                continue
            tracks = [{"id":item.get('track').get("id"),
            "artists":item.get('track').get('album').get("artists"),
            "name":item.get('track').get("name"),} for item in tracks_response.get("items")]
            all_tracks.append(tracks)
        return Response(all_tracks,status=status.HTTP_200_OK)


