from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, QueryDict
from .models import Part, Category, Word, Value
import json


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
        part.f_value = data.get('value')
        part.save()
        return HttpResponse(part.id)

    if request.method == 'PUT':
        part = Part.objects.get(pk=data.get('id'))
        part.f_value = data.get('value')
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
        category.f_value = data.get('value')
        category.f_color = data.get('color')
        category.save()
        return HttpResponse(category.id)

    if request.method == 'PUT':
        category = Category.objects.get(pk = data.get('id'))
        category.f_value = data.get('value')
        category.f_color = data.get('color')
        category.save()
        return HttpResponse('OK')

    if request.method == 'DELETE':
        category = Category.objects.get(pk = data.get('id'))
        category.delete()
        return HttpResponse('OK')


def words_get_category(request, category_id):
    if request.method == 'GET':
        words = Word.objects.all()
        words = words.order_by('-f_hard')
        if category_id > 0:
            words = words.filter(f_category__id = category_id)
        return JsonResponse(get_normal_data(words), safe = False)


def words_get_self(request, word_id):
    word = Word.objects.get(pk = word_id)
    return JsonResponse(word.get_dict_full(), safe = False)


def words_hard(request):
    id = request.POST['id']
    hard = request.POST['hard']
    word = Word.objects.get(pk = id)
    word.f_hard = bool(int(hard))
    word.save()
    return HttpResponse(str(id) + ' ' + hard)


def words(request):
    data = QueryDict(request.body)

    if request.method == 'DELETE':
        word = Word.objects.get(pk = data['id'])
        word.delete()
        return HttpResponse('OK')
    
    if request.method == 'PUT':
        obj = json.loads(data['data'])

        # Сохранение самого слова
        word = Word.objects.get(pk = obj['id'])
        word.f_value = obj['originalValue']        
        try:
            category = Category.objects.get(f_value = obj['category'])
        except Category.DoesNotExist:
            category = None
        word.f_category = category
        word.save()

        values = Value.objects.filter(f_word = word)
        for value in Value.objects.filter(f_word = word):
            value.delete()

        for i in obj['translatedValues']:
            if i['part'] == None:
                continue
            for j in i['values']:
                if j == None:
                    continue
                value = Value(
                    f_word = word,
                    f_part = Part.objects.get(f_value = i['part']),
                    f_value = j
                )
                value.save()

        return HttpResponse('OK')

    if request.method == 'POST':
        obj = json.loads(data['data'])

        # Вдруг нет такой категории
        category = None
        try:
            category = Category.objects.get(f_value = obj['category'])
        except Category.DoesNotExist:
            pass

        word = Word(
            f_value = obj['originalValue'],
            f_category = category
        )
        word.save()

        for i in obj['translatedValues']:
            if i['part'] == None:
                continue
            for j in i['values']:
                if j == None:
                    continue
                value = Value(
                    f_word = word,
                    f_part = Part.objects.get(f_value = i['part']),
                    f_value = j
                )
                value.save()

        return HttpResponse(word.id)


def get_normal_data(objects):
    # objects это QuerySet, в используемой модели должен быть метод get_dict
    ar = []
    for i in objects:
        ar.append(i.get_dict())
    return ar
        