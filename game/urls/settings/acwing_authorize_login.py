from django.urls import path
from game.views.settings.acwing_authorize_login import obtain_authorization,third_party_login
urlpatterns = [
    path("obtain_authorization/", obtain_authorization, name="settings.acwing_authorize_login.obtain_authorization"),
    path("third_party_login/", third_party_login, name="settings.acwing_authorize_login.third_party_login"),
]
