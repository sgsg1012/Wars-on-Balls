from django.urls import path
from game.consumers.multiplayer import MultiPlayer
websocket_urlpatterns = [
    path("wss/multiplayer/", MultiPlayer.as_asgi(), name="wss.multiplayer"),
]