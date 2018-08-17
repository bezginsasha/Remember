from django.db import models

class Part(models.Model):
    value = models.CharField(max_length = 32)

    def get_dict(self):
        return ({
            'id': self.id,
            'value': self.value
        })


class Category(models.Model):
    value = models.CharField(max_length = 32)
    color = models.CharField(max_length = 6)

    def get_dict(self):
        return ({
            'id': self.id,
            'value': self.value,
            'color': self.color
        })

# class Word