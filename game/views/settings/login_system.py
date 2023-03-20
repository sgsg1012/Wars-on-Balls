from django.http import JsonResponse
from game.models.player.player import Player
from django.contrib.auth import login,logout,authenticate
from django.contrib.auth.models import User 

# 获取当前用户登录信息
def getinfo(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "未登录",
            'user': str(user)
        })
    else:
        player = Player.objects.get(user=user)
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
            'platform': "web",
        })

# login 登录
def signin(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)
    if not user:
        return JsonResponse({
            'result': "用户名或密码不正确"
        })
    login(request, user) # django登录函数
    return JsonResponse({
        'result': "success"
    })

# logout 登出
def signout(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "success",
            'state': "not log in",
            'user': str(user),
        })
    logout(request)
    return JsonResponse({
        'result': "success",
        'state': "logout",
        'user': str(user),
    })

# 注册
def register(request):
    data = request.GET
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "两个密码不一致",
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在"
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://app907.acapp.acwing.com.cn/static/image/settings/default_photo.png")
    login(request, user)
    return JsonResponse({
        'result': "success",
        'user':str(user)
    })
