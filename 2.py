import requests
from lxml import etree
import docx
import time
import random
from fake_useragent import UserAgent
import urllib

user_agent = [
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:38.0) Gecko/20100101 Firefox/38.0",
]
headers = {'User-Agent': random.choice(user_agent)}
import redis
import random
from urllib import request
import urllib


def get_Data():
    name = input("爬取的小说：")
    url1 = 'http://www.ibiqu.net/book/52542/'
    res = requests.get(url=url1, headers=headers)
    if res.status_code == 200:
        text = res.text
        list1 = etree.HTML(text)
        lie = list1.xpath('//*[@id="list"]//dd/a/@href')[9:]
        title = list1.xpath('//*[@id="list"]//dd/a/text()')[9:]
        for i, j in zip(lie, title):
            next_url = urllib.parse.urljoin('http://www.ibiqu.net/book/52542/20380548.htm', i)
            neirong(next_url, j, name)
            # print(next_url)


def neirong(zhangjieid, title, name):
    # print(zhangjieid,title)
    res = requests.get(zhangjieid, headers=headers)
    text = res.text
    hu = etree.HTML(text)
    nei = "".join(hu.xpath('//*[@id="content"]/p/text()'))
    # # n = nei.replace("全文阅读", "").replace("本章未完，点击下一页继续阅读。", "")
    print("正在爬第" + title)
    with open(f"{name}.txt", "a", encoding='utf-8')as f:
        f.write(title)
        f.write('\n')
        f.write(nei)
        f.write('\n')
        f.write('\n')
    time.sleep(1)


if __name__ == '__main__':
    get_Data()
