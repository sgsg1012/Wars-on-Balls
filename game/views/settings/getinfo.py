from django.http import JsonResponse
from game.models.player.player import Player


def getinfo_acapp(request):
    # user = request.user
    # if not user.is_authenticated:
    #     return JsonResponse({
    #         'result': "未登录",
    #         'user': str(user)
    #     })
    # else:
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
        'platform': "acapp",
    })

def getinfo_web(request):
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


def getinfo(request):
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
    else:
        return getinfo_web(request)
