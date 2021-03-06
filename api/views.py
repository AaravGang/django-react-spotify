from django.shortcuts import render
from rest_framework import generics,status
from .models import Room
from .serializers import RoomSerializer,CreateRoomSerializer,UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# Create your views here.
class Roomview(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class  = RoomSerializer

    



class GetRoom(APIView):
    # serializer_class=RoomSerializer
    lookup_url_kwarg = "code"
    def get(self,request,format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code:
            room = Room.objects.filter(code=code)
            if len(room)>0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key==room[0].host
                return Response(data,status=status.HTTP_200_OK)
            return Response({"Room Not Found":"Invalid Room Code"},status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad request":"Did not find code parameter in request."},status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    lookup_url_kwarg = "code"

    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        code = request.data.get(self.lookup_url_kwarg)
      
        if code:
            room = Room.objects.filter(code=code)
            if len(room)>0:
                self.request.session["room_code"] = code
                return Response({"Success":"Joined Room"},status=status.HTTP_200_OK)
            return Response({"Invalid Code":"Room with provided code not found."},status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad request":"Did not find code parameter in request."},status=status.HTTP_400_BAD_REQUEST)





class CreateRoomView(APIView):
    # serializer_class = CreateRoomSerializer

    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = CreateRoomSerializer(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['votes_to_skip','guest_can_pause'])
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data,status=status.HTTP_200_OK)

            else:
                room = Room(host=host,guest_can_pause=guest_can_pause,votes_to_skip=votes_to_skip)

                room.save()
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data,status=status.HTTP_201_CREATED)
        return Response({"Bad Request": "Invalid Data..."},status=status.HTTP_400_BAD_REQUEST)


class RedirectRoom(APIView):
    def get(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        data = {
            "code":self.request.session.get("room_code"),
        }
        return JsonResponse(data,status=status.HTTP_200_OK)

class LeaveRoom(APIView):
    def post(self,request,format=None):
        if "room_code" in self.request.session:
            code=self.request.session.pop("room_code")
            queryset = Room.objects.filter(code=code)
            if len(queryset)>0:
                room = queryset[0]
                if room.host== self.request.session.session_key:
                    room.delete()
                    return Response({'Message': 'Success'}, status=status.HTTP_200_OK)
            return Response({'error': 'Room with given code does not exist!'}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error":"Internal server error"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateRoom(APIView):
    serializer_class=UpdateRoomSerializer
    def patch(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
               return Response({"Bad Request": "Room Not Found"},status=status.HTTP_404_NOT_FOUND)
            
            room = queryset[0]
            user_id = self.request.session.session_key
            if user_id!=room.host:
                return Response({"message":"You cannot change the settings of this room as you are not the host!"},status=status.HTTP_403_FORBIDDEN)
            
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=["guest_can_pause","votes_to_skip"])
            return Response(RoomSerializer(room).data,status=status.HTTP_200_OK)

        return Response({"Bad Request":"Invalid Data!"},status=status.HTTP_400_BAD_REQUEST)

            


