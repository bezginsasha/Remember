from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import Part


def index(request):
    return render(request, 'app/index.html')


def parts(request):
    parts = Part.objects.all()
    parts = get_normal_data(parts)
    return JsonResponse(parts, safe = False)


def get_normal_data(objects):
    # objects это QuerySet, в используемой модели должен быть метод get_dict
    ar = []
    for i in objects:
        ar.append(i.get_dict())
    return ar
        