from django.db import models
import random
from string import ascii_uppercase as uppercase

def generate_code():
    length=6
    while True:
        code = ''.join(random.choices(uppercase,k=length))
        if Room.objects.filter(code=code).count()==0:
            return code
    
# Create your models here.
class Room(models.Model):  
    code = models.CharField(max_length=8,unique=True,default=generate_code)
    host = models.CharField(max_length=50,unique=True)
    guest_can_pause = models.BooleanField(default=False,null=False)
    votes_to_skip = models.IntegerField(default=1,null=False)
    created_at = models.DateTimeField(auto_now_add=True)

