from django.http import JsonResponse
from django.contrib.auth import logout


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
