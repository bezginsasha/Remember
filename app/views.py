from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, QueryDict
from .models import Part, Category


@ensure_csrf_cookie
def index(request):
    return render(request, 'app/index.html')


def parts(request, part_id = 0):
    if part_id:
        part = Part.objects.get(pk=part_id)
        return JsonResponse(part.get_dict())

    if request.method == 'GET':
        parts = Part.objects.all()
        parts = get_normal_data(parts)    
        return JsonResponse(parts, safe = False)

    data = QueryDict(request.body)

    if request.method == 'POST':
        part = Part.objects.create()
        part.value = data.get('value')
        part.save()
        return HttpResponse(part.id)

    if request.method == 'PUT':
        part = Part.objects.get(pk=data.get('id'))
        part.value = data.get('value')
        part.save()
        return HttpResponse('OK')

    if request.method == 'DELETE':
        part = Part.objects.get(pk=data.get('id'))
        part.delete()
        return HttpResponse('OK')


def categories(request, category_id = 0):
    if category_id:
        category = Category.objects.get(pk = category_id)
        return JsonResponse(category.get_dict())

    if request.method == 'GET':
        categories = Category.objects.all()
        return JsonResponse(get_normal_data(categories), safe=False)

    data = QueryDict(request.body)
    
    if request.method == 'POST':
        category = Category.objects.create()
        category.value = data.get('value')
        category.color = data.get('color')
        category.save()
        return HttpResponse(category.id)

    if request.method == 'PUT':
        category = Category.objects.get(pk = data.get('id'))
        category.value = data.get('value')
        category.color = data.get('color')
        category.save()
        return HttpResponse('OK')

    if request.method == 'DELETE':
        category = Category.objects.get(pk = data.get('id'))
        category.delete()
        return HttpResponse('OK')


def get_normal_data(objects):
    # objects это QuerySet, в используемой модели должен быть метод get_dict
    ar = []
    for i in objects:
        ar.append(i.get_dict())
    return ar
        