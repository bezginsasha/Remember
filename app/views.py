from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, QueryDict
from .models import Part

@ensure_csrf_cookie
def index(request):
    return render(request, 'app/index.html')

def parts(request, part_id=0):
    if part_id and request.method == 'GET':
        part = Part.objects.get(pk=part_id)
        return JsonResponse({
            'id': part.id,
            'value': part.value
        })

    if request.method == 'GET':
        parts = Part.objects.all()
        parts = get_normal_data(parts)    
        return JsonResponse(parts, safe = False)

    if request.method == 'POST':
        part = Part.objects.create()
        part.value = request.POST['value']
        part.save()
        return HttpResponse(int(part.id))

    if request.method == 'PUT':
        put = QueryDict(request.body)
        part = Part.objects.get(pk=put.get('id'))
        part.value = put.get('value')
        part.save()
        return HttpResponse('OK')

    if request.method == 'DELETE':
        delete = QueryDict(request.body)
        part = Part.objects.get(pk=delete.get('id'))
        part.delete()
        return HttpResponse('OK')




def get_normal_data(objects):
    # objects это QuerySet, в используемой модели должен быть метод get_dict
    ar = []
    for i in objects:
        ar.append(i.get_dict())
    return ar
        