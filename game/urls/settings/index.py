from django.urls import path, include
from game.views.settings.login_system import getinfo,signin,signout,register


urlpatterns = [
    path("login_system/", include('game.urls.settings.login_system')),
    path("acwing/", include('game.urls.settings.acwing_authorize_login')),
]
