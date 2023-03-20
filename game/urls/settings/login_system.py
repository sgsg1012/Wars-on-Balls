from django.urls import path
from game.views.settings.login_system import getinfo,signin,signout,register

urlpatterns = [
    path("getinfo/", getinfo, name="settings.login_system.getinfo"),
    path("login/", signin, name="settings.login_system.login"),
    path("logout/", signout, name="settings.login_system.logout"),
    path("register/", register, name="settings.login_system.register"),
]
