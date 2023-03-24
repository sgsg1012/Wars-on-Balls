from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache
from django.conf import settings
import json

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print("connect")

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.creat_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "is_attacked":
            await self.is_attacked(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "dead":
            await self.delete_user(data)
        elif event == "message":
            await self.send_message(data)

    async def creat_player(self, data):
        # 分配房间
        self.room_name = None
        for i in range(1000):
            name = "room-%d" %(i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break
        if not self.room_name: # 没有空闲房间
            return 
        # 如果redis中没有房间则创建房间
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) # 房间有效期1小时
        
        # 把房间中之前的玩家信息发送到客户端
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        # 把玩家加到房间里
        await self.channel_layer.group_add(self.room_name, self.channel_name)

        players = cache.get(self.room_name)
        # print(data)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        cache.set(self.room_name, players,3600) #更新redis数据库，并更新持续时间

        # 把自己的信息发送给房间中每个玩家
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )

    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shoot_fireball",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def is_attacked(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "is_attacked",
                'uuid': data['uuid'],
                'angle': data['angle'],
                'damage': data['damage'],
            }
        )

    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )


    async def delete_user(self, data):
        uuid = data['uuid']
        players = cache.get(self.room_name)
        for player in players:
            if player['uuid'] == uuid:
                players.remove(player)
                break
        cache.set(self.room_name, players,3600) #更新redis数据库，并更新持续时间



    async def send_message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'username': data['username'],
                'text': data['text']
            }
        )

    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))


        