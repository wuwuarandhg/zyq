# class Parent:  # 定义父类
#     def myMethod(self):
#         print('调用父类方法')
#
#
# class Child(Parent):  # 定义子类
#     def myMethod(self):
#         print('调用子类方法')
#
#
# c = Child()  # 子类实例
# c.myMethod()  # 子类调用重写方法
# super(Child, c).myMethod()  # 用子类对象调用父类已被覆
# class A:
#     def add(self, x):
#         y = x + 1
#         print(y)
#
#
# class B(A):
#     pass
#     def add(self, x):
#        print(x)
#
#
# b = B()
# b.add(2)  # 3
# super(B,b).add(2)
# class Father(object):
#     def __init__(self, name):
#         self.name = name
#         print("name: %s" % (self.name))
#
#     def getName(self,x):
#         print(x)
#         return 'Father ' + self.name
#
#
#
# class Son(Father):
#     def __init__(self, name):
#         super(Son, self).__init__(name)
#         print("hi")
#         self.name = name
#
#     def getName(self):
#         return 'Son ' + self.name
#
#
# if __name__ == '__main__':
#     son = Son('runoob')
#     print(son.getName())
#     super(Son,son).getName('你好')
# class people:
#     # 定义基本属性
#     name = ''
#     age = 0
#     # 定义私有属性,私有属性在类外部无法直接进行访问
#     __weight = 0
#
#     # 定义构造方法
#     def __init__(self, n, a, w):
#         self.name = n
#         self.age = a
#         self.__weight = w
#
#     def speak(self):
#         print("%s 说: 我 %d 岁。" % (self.name, self.age))
#
#
# # 单继承示例
# class student(people):
#     grade = ''
#
#     def __init__(self, n, a, w, g):
#         # 调用父类的构函
#         people.__init__(self, n, a, w)
#         self.grade = g
#
#     # 覆写父类的方法
#     def speak(self):
#         print("%s 说: 我 %d 岁了，我在读 %d 年级" % (self.name, self.age, self.grade))
#
#
# # 另一个类，多重继承之前的准备
# class speaker():
#     topic = ''
#     name = ''
#
#     def __init__(self, n, t):
#         self.name = n
#         self.topic = t
#
#     def speak(self):
#         print("我叫 %s，我是一个演说家，我演讲的主题是 %s" % (self.name, self.topic))
#
#
# # 多重继承
# class sample(speaker, student):
#     a = ''
#
#     def __init__(self, n, a, w, g, t):
#         student.__init__(self, n, a, w, g)
#         speaker.__init__(self, n, t)
#
#
# test = sample("Tim", 25, 80, 4, "Python")
# test.speak()  # 方法名同，默认调用的是在括号中参数位置排前父类的方法
print("jdhjkh");
