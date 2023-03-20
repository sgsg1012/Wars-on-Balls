from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache
from django.shortcuts import redirect
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login


# 返回一个随机的state码 用于验证身份
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

# 接口一：处理用户第三方登录请求，返回用户重定向链接，让用户访问acwing端接口
def obtain_authorization(request):
    appid = "907"
    redirect_uri = quote("https://app907.acapp.acwing.com.cn/settings/acwing_authorize_login/third_party_login")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200)   # 有效期2小时

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })
    

# 接口二：用于接收acwing服务器返回的code，根据code获取token 根据token获取用户信息 登录
def third_party_login(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return redirect("main_page")
    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': "907",
        'secret': "de69aa09a60c46c9b721af19568ed6e7",
        'code': code
    }

    access_token_res = requests.get(apply_access_token_url, params=params).json()

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)
    if players.exists():  # 如果该用户已存在，则无需重新获取信息，直接登录即可
        login(request, players[0].user)
        return redirect("main_page")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists():  # 找到一个新用户名
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)

    return redirect("main_page")
