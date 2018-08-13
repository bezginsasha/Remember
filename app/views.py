from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import Part

@ensure_csrf_cookie
def index(request):
    return render(request, 'app/index.html')

def parts(request, part_id):
    parts = Part.objects.get(pk=part_id)
    # parts = get_normal_data(parts)
    return HttpResponse(str(parts.id) + '. ' + parts.value)
    # return JsonResponse(parts, safe = False)
    # return HttpResponse(request.method)


def get_normal_data(objects):
    # objects это QuerySet, в используемой модели должен быть метод get_dict
    ar = []
    for i in objects:
        ar.append(i.get_dict())
    return ar
        