"""
《C榜追踪器》第1天，requests采集csdn热榜数据 - Peng
"""
import requests
import json
import time
import random

page_size = 25
host_url = 'https://blog.csdn.net/phoenix/web/blog/hot-rank'

headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/94.0.4606.81 Safari/537.36 '
}

all_results = []


# 获取两页数据
def get_Data():
    for page in range(4):
        res = requests.get(host_url + f'?page={page}&pageSize={page_size}', headers=headers)
        # time.sleep(random.choice(range(10,15)))
        print(res.json())
        if res.status_code == 200:
            try:
                for data in res.json()['data']:
                    all_results.append({
                        'hotRankScore': data['hotRankScore'],
                        'nickName': data['nickName'],
                        'articleTitle': data['articleTitle'],
                        'articleDetailUrl': data['articleDetailUrl'],
                        'commentCount': data['commentCount'],
                        'favorCount': data['favorCount'],
                        'viewCount': data['viewCount'],
                    })
            except Exception as e:
                raise e


# 数据存为 json 文件
def sava_Data():
    with open('data.txt', 'a', encoding='utf-8') as f:
        json.dump(all_results, f)


if __name__ == '__main__':
    get_Data()
    sava_Data()
