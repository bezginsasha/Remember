from django.db import models

class Part(models.Model):
    f_value = models.CharField(max_length = 32)

    def get_dict(self):
        return ({
            'id': self.id,
            'value': self.f_value
        })


class Category(models.Model):
    f_value = models.CharField(max_length = 32)
    f_color = models.CharField(max_length = 6)

    def get_dict(self):
        return ({
            'id': self.id,
            'value': self.f_value,
            'color': self.f_color
        })


class Word(models.Model):
    f_value = models.CharField(max_length = 32)
    f_category = models.ForeignKey(Category, on_delete = models.CASCADE, null = True, default = None, blank = True)

    def get_dict(self):
        return {
            'id': self.id,
            'value': self.f_value,
        }

    def get_dict_full(self):
        translated_values = []
        part_id = 0
        obj = None
        
        for i in Value.objects.filter(f_word__id = self.id):
            if part_id != i.f_part.id:
                if obj:
                    translated_values.append(obj)
                part_id = i.f_part.id
                obj = {
                    'part': i.f_part.f_value,
                    'values': [ i.f_value ]
                }
            else:
                obj['values'].append(i.f_value)
        translated_values.append(obj)

        if self.f_category:
            category = self.f_category.f_value
        else:
            category = None

        word = {
            'id': self.id,
            'originalValue': self.f_value,
            'category': category,
            'translatedValues': translated_values
        }

        return word


class Value(models.Model):
    f_word = models.ForeignKey(Word, on_delete = models.CASCADE)
    f_part = models.ForeignKey(Part, on_delete = models.CASCADE)
    f_value = models.CharField(max_length = 32)

    # def get_dict(self):
    #     return ({
    #         'id': self.id,
    #         # 'word_id': self.f_word.id,
    #         # 'part_id': self.f_part.id,
    #         'part': self.f_part.f_value
    #         'value': self.f_value
    #     })